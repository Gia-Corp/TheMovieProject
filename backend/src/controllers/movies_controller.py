from fastapi import APIRouter, Query
from pydantic import BaseModel
from ..persistence.movies_sheet_connector import (
    MoviesSheetConnector,
)
from ..pagination.movies_page import MoviesPage
from ..pagination.page_metadata_calculator import PageMetadataCalculator
import src.settings as settings
import gspread
from ..domain.movie import (
    Movie,
)


client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
movies_sheet = client.open(settings.SHEET_NAME).sheet1


movies = APIRouter(
    tags=["Movies"],
)


@movies.get("/movies")
async def get_movies(
    page: int = Query(..., gt=0),
    size: int = Query(..., gt=0),
):
    connector = MoviesSheetConnector(movies_sheet)
    page_obj = MoviesPage(page, size)
    movies = connector.get_movies_by_page(page_obj)
    movie_count = connector.get_movie_count()
    metadata = PageMetadataCalculator().calculate(page_obj, movie_count, "/movies")

    return {"metadata": metadata, "movies": movies}


class MovieCreateRequest(BaseModel):
    title: str
    director: str
    year: int
    watched: bool


@movies.post("/movies")
async def create_movie(movie_data: MovieCreateRequest):
    movie = Movie(
        movie_data.title,
        movie_data.director,
        movie_data.year,
        movie_data.watched,
    )
    connector = MoviesSheetConnector(movies_sheet)
    connector.add_movie(movie)
    return {"message": "Successful!"}


# @movies.patch("/movies/<id>")
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
