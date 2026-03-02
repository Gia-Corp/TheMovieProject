from fastapi import APIRouter, Query, Depends, Path
from src.infra import GoogleSheetsMovieRepository
from src.application.pagination import Page, PageMetadataCalculator
from src.domain import Movie
from src.dependencies import get_movie_repo
from src.application.dtos import CreateMovieDTO, UpdateMovieDTO

movies_controller = APIRouter(
    tags=["Movies"],
)


@movies_controller.get("/movies")
async def get_movies(
    page: int = Query(..., gt=0),
    size: int = Query(..., gt=0),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    page = Page(page, size)
    movies = movie_repo.get_movies_by_page(page)
    movie_count = movie_repo.get_movie_count()
    metadata = PageMetadataCalculator().calculate(page, movie_count, "/movies")

    return {"metadata": metadata, "movies": movies}


@movies_controller.post("/movies")
async def create_movie(
    movie_dto: CreateMovieDTO,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    movie = Movie(
        id=1,
        title=movie_dto.title,
        director=movie_dto.director,
        year=movie_dto.year,
        watched=movie_dto.watched,
    )
    return movie_repo.add(movie)


@movies_controller.patch("/movies/{movie_id}")
async def update_movie(
    movie_id: int = Path(
        ..., gt=0, description="El ID de la película debe ser mayor a 0"
    ),
    movie_dto: UpdateMovieDTO = None,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    # movie = movie_repo.get_by_id(movie_id)

    # if not movie:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail=f"Movie with id {movie_id} not found",
    #     )
    return {"id": movie_id}
