from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from src.infra.google_sheets_movie_repository import (
    GoogleSheetsMovieRepository,
)
from src.application.pagination.movies_page import MoviesPage
from src.application.pagination.page_metadata_calculator import PageMetadataCalculator
from src.domain.movie import (
    Movie,
)
from src.dependencies import get_movie_repo

movies_controller = APIRouter(
    tags=["Movies"],
)


@movies_controller.get("/movies")
async def get_movies(
    page: int = Query(..., gt=0),
    size: int = Query(..., gt=0),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    page_obj = MoviesPage(page, size)
    movies = movie_repo.get_movies_by_page(page_obj)
    movie_count = movie_repo.get_movie_count()
    metadata = PageMetadataCalculator().calculate(page_obj, movie_count, "/movies")

    return {"metadata": metadata, "movies": movies}


class MovieCreateRequest(BaseModel):
    title: str
    director: str
    year: int
    watched: bool


@movies_controller.post("/movies")
async def create_movie(
    movie_data: MovieCreateRequest,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    movie = Movie(
        movie_data.title,
        movie_data.director,
        movie_data.year,
        movie_data.watched,
    )
    movie_repo.add_movie(movie)
    return {"message": "Successful!"}


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
