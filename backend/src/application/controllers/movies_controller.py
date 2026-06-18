from fastapi import APIRouter, Query, Depends, Path
from src.infra import (
    GoogleSheetsMovieRepository,
    MovieNotFoundError,
    PageOutOfBoundsError,
    ExternalAPIMovieRepository,
    MovieAlreadyExistsError,
    GoogleSheetsUserRepository,
    UserNotFoundError,
    GoogleSheetsWatchEventRepository,
)
from src.application.pagination import Page, PageMetadataCalculator
from src.application.assemble import MovieSummaryAssembler, MovieDetailAssembler
from src.domain import Movie, WatchEvent
from src.dependencies import (
    get_movie_repo,
    get_external_api_movie_repo,
    get_user_repo,
    get_current_user,
    get_watch_event_repo,
)
from src.application.dtos import CreateMovieDTO, UpdateMovieDTO, GetMoviesResponseDTO
from typing import Optional
import math

movies_controller = APIRouter(
    prefix="/api",
    tags=["Movies"],
)


# MIN = 4 CALLS, MAX = 5 CALLS
@movies_controller.get("/movies", response_model=GetMoviesResponseDTO)
async def get_movies(
    page: int = Query(..., gt=0),
    size: int = Query(..., gt=0),
    title: Optional[str] = None,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
):
    page = Page(page, size)

    if title:
        movies = movie_repo.find_by_title(title)  # 2 CALLS
        if not movies:
            raise MovieNotFoundError()

        start = page.number * page.size - page.size
        end = page.number * page.size
        movie_count = len(movies)

        page_count = math.ceil(movie_count / page.size)
        if page.number > page_count:
            raise PageOutOfBoundsError

        movies = movies[start:end]
    else:
        movies = movie_repo.get_all_by_page(page)  # 2 CALLS
        movie_count = movie_repo.total_movies()  # 1 CALL

    metadata = PageMetadataCalculator().calculate(page, movie_count, "/api/movies")

    user_count = user_repo.get_user_count()  # 1 CALL
    watch_events = watch_event_repo.find_all_by_movies(movies)  # 1 CALL
    movies = MovieSummaryAssembler(user_count, watch_events).assemble_many(movies)

    return {"metadata": metadata, "movies": movies}


# 4 CALLS
@movies_controller.get("/movies/{movie_id}")
async def get_movie(
    movie_id: int = Path(
        ..., gt=0, description="El ID de la película debe ser mayor a 0"
    ),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
):
    movie = movie_repo.get_by_id(movie_id)  # 1 CALL

    users = user_repo.get_all()  # 1 CALL
    watch_events = watch_event_repo.find_by_movie_id(movie_id)  # 2 CALLS
    return MovieDetailAssembler(users, watch_events).assemble(movie)


# N + 8 CALLS
@movies_controller.post("/movies")
async def create_movie(
    movie_dto: CreateMovieDTO,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    external_api_movie_repo: ExternalAPIMovieRepository = Depends(
        get_external_api_movie_repo
    ),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user=Depends(get_current_user),
):
    movie_exists = movie_repo.exists_by_title(movie_dto.title)  # 1 CALL
    if movie_exists:
        raise MovieAlreadyExistsError()

    movie_info = await external_api_movie_repo.get_by_title_and_year(
        movie_dto.title, movie_dto.year
    )  # 1 CALL

    if movie_dto.watched_by:
        users_exist = user_repo.all_exist(movie_dto.watched_by)  # 1 CALL
        if not users_exist:
            raise UserNotFoundError()

    movie = Movie(
        id=1,
        title=movie_info["Title"],
        director=movie_info["Director"],
        year=int(movie_info["Year"]),
        runtime=movie_info["Runtime"] if movie_info["Runtime"] != "N/A" else None,
        plot=movie_info["Plot"] if movie_info["Plot"] != "N/A" else None,
        poster_url=movie_info["Poster"] if movie_info["Poster"] != "N/A" else None,
    )
    movie = movie_repo.add(movie)  # 3 CALLS

    watch_events = [
        WatchEvent(movie_id=movie.id, user_id=u) for u in movie_dto.watched_by
    ]
    watch_event_repo.add_many(watch_events)  # N + 2 CALLS

    return movie


# 3 CALLS
@movies_controller.patch("/movies/{movie_id}")
async def update_movie(
    movie_id: int = Path(
        ..., gt=0, description="El ID de la película debe ser mayor a 0"
    ),
    movie_dto: UpdateMovieDTO = None,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    current_user=Depends(get_current_user),
):
    movie = movie_repo.get_by_id(movie_id)  # 1 CALL

    if movie_dto.title:
        movie.title = movie_dto.title

    if movie_dto.director:
        movie.director = movie_dto.director

    if movie_dto.year:
        movie.year = movie_dto.year

    if movie_dto.runtime:
        movie.runtime = movie_dto.runtime

    if movie_dto.plot:
        movie.plot = movie_dto.plot

    if movie_dto.poster_url:
        movie.poster_url = movie_dto.poster_url

    movie.validate()

    movie = movie_repo.save(movie)  # 2 CALLS
    if not movie:
        raise MovieNotFoundError(movie_id)

    return movie


# 5 CALLS
@movies_controller.delete("/movies/{movie_id}")
async def delete_movie(
    movie_id: int = Path(
        ..., gt=0, description="El ID de la película debe ser mayor a 0"
    ),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user=Depends(get_current_user),
):
    movie = movie_repo.get_by_id(movie_id)  # 1 CALL

    movie_repo.delete(movie_id)  # 2 CALLS
    watch_event_repo.delete_by_movie_id(movie_id)  # 2 CALLS

    return movie
