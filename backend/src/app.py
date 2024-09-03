from flask import Flask, jsonify, request
from movies_sheet_connector import (
    MoviesSheetConnector,
)
from movies_page import MoviesPage, InvalidPageNumberError, InvalidPageSizeError
from page_metadata_calculator import PageMetadataCalculator
from sheets import update_movie, add_movie
from flask_cors import CORS
import config
import gspread

app = Flask(__name__)
CORS(app)
client = gspread.service_account_from_dict(config.SHEET_CREDENTIALS)
movies_sheet = client.open(config.SHEET_NAME).sheet1


@app.route("/")
def hello_world():
    return jsonify("Hello World!")


@app.errorhandler(InvalidPageNumberError)
@app.errorhandler(InvalidPageSizeError)
def invalid_page(error):
    return jsonify(error.to_dict()), error.status_code


@app.route("/movies")
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


@app.route("/update", methods=["POST"])
def update():
    try:
        id = request.json["id"]
        title = request.json["title"]
        director = request.json["director"]
        watched = request.json["watched"]

        update_movie(id, title, director, watched)

        return jsonify("Success")
    except Exception as err:
        return str(err), 500


@app.route("/add", methods=["POST"])
def add():
    try:
        title = request.json["title"]
        director = request.json["director"]
        watched = request.json["watched"]

        add_movie(title, director, watched)

        return jsonify("Success")
    except Exception as err:
        return str(err), 500


if __name__ == "__main__":
    app.run(host="backend", port=config.PORT, debug=True)
