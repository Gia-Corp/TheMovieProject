from fastapi import APIRouter, Query, Depends
from src.infra import GoogleSheetsMovieRepository
from src.application.pagination import Page, PageMetadataCalculator
from src.domain import Movie
from src.dependencies import get_movie_repo
from src.application.dtos import CreateMovieDTO

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


# @movies_controller.patch("/movies/<id>")
# def update_movie():
#     try:
#         id = request.json["id"]
#         title = request.json["title"]
#         director = request.json["director"]
#         watched = request.json["watched"]

#         update_movie(id, title, director, watched)

#         return jsonify("Success")
#     except Exception as err:
#         return str(err), 500
