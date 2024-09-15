from flask import jsonify, request, Blueprint
from persistence.movies_sheet_connector import (
    MoviesSheetConnector,
)
from movies_page import MoviesPage, InvalidPageNumberError, InvalidPageSizeError
from page_metadata_calculator import PageMetadataCalculator
import settings
import gspread
from domain.movie import (
    EmptyMovieDirectorError,
    EmptyMovieTitleError,
    NegativeMovieYearError,
)

movies = Blueprint("movies_controller", __name__)

client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
movies_sheet = client.open(settings.SHEET_NAME).sheet1


@movies.errorhandler(NegativeMovieYearError)
@movies.errorhandler(EmptyMovieTitleError)
@movies.errorhandler(EmptyMovieDirectorError)
@movies.errorhandler(InvalidPageNumberError)
@movies.errorhandler(InvalidPageSizeError)
def api_error(error):
    return jsonify(error.to_dict()), error.status_code


@movies.get("/movies")
def get_movies():
    page_number = request.args.get("page")
    if not page_number or not page_number.isnumeric():
        raise InvalidPageNumberError(page_number)
    page_number = int(page_number)

    page_size = request.args.get("size")
    if not page_size or not page_size.isnumeric():
        raise InvalidPageSizeError(page_size)
    page_size = int(page_size)

    connector = MoviesSheetConnector(movies_sheet)
    page = MoviesPage(page_number, page_size)
    movies = connector.get_movies_by_page(page)
    movie_count = connector.get_movie_count()
    metadata = PageMetadataCalculator().calculate(page, movie_count, "/movies")
    return {"metadata": metadata, "movies": movies}


@movies.post("/movies")
def create_movie():
    # movie = Movie(request.json["title"], request.json["director"], request.json["year"], request.json["watched"])
    return jsonify("Successful!")
    # add_movie(title, director, watched)


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
