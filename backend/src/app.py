from flask import Flask, jsonify, request
from movies_sheet_connector import (
    MoviesSheetConnector,
    PageOutOfBoundsError,
)
from movies_page import MoviesPage, InvalidPageNumberError, InvalidPageSizeError
from page_metadata_calculator import PageMetadataCalculator
from datetime import datetime
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


@app.route("/movies")
def get_movies():
    try:
        connector = MoviesSheetConnector(movies_sheet)
        page_number = request.args.get("page")
        page_size = request.args.get("size")
        page_number = int(page_number) if page_number and page_number.isnumeric() else 1
        page_size = int(page_size) if page_size and page_size.isnumeric() else 10
        page = MoviesPage(page_number, page_size)
        movies = connector.get_movies_by_page(page)
        movie_count = connector.get_movie_count()
        metadata = PageMetadataCalculator().calculate(page, movie_count, "/movies")
        return {"metadata": metadata, "movies": movies}
    except Exception as error:
        match error:
            case InvalidPageNumberError() | InvalidPageSizeError():
                status_code = 400
                status_code_title = "Bad Request"
            case PageOutOfBoundsError():
                status_code = 404
                status_code_title = "Not Found"

        response = {
            "timestamp": str(datetime.now()),
            "status": status_code,
            "error": status_code_title,
            "message": str(error),
            "path": request.path,
        }
        return response, status_code


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
