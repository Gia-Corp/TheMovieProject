from flask import jsonify, request, Blueprint
from persistence.movies_sheet_connector import (
    MoviesSheetConnector,
)
from movies_page import MoviesPage, InvalidPageNumberError, InvalidPageSizeError
from page_metadata_calculator import PageMetadataCalculator
import config
import gspread

movies_controller = Blueprint("movies_controller", __name__)

client = gspread.service_account_from_dict(config.SHEET_CREDENTIALS)
movies_sheet = client.open(config.SHEET_NAME).sheet1


@movies_controller.route("/movies")
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


@movies_controller.errorhandler(InvalidPageNumberError)
@movies_controller.errorhandler(InvalidPageSizeError)
def invalid_page(error):
    return jsonify(error.to_dict()), error.status_code
