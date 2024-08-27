from flask import Flask, jsonify, request
from google_sheet_connector import (
    GoogleSheetConnector,
    PageOutOfBoundsError,
)
from movies_page import MoviesPage, InvalidPageNumberError, InvalidPageSizeError
from datetime import datetime
from sheets import update_movie, add_movie
from flask_cors import CORS
import config
import gspread

app = Flask(__name__)
CORS(app)
gc = gspread.service_account_from_dict(config.SHEET_CREDENTIALS)
sheet = gc.open(config.SHEET_NAME).sheet1


@app.route("/")
def hello_world():
    return jsonify("Hello World!")


@app.route("/movies")
def get_movies():
    try:
        connector = GoogleSheetConnector(sheet)
        page = MoviesPage(int(request.args.get("page")), int(request.args.get("size")))
        movies = connector.get_movies_by_page(page)
        # metadata = connector.get_pagination_metadata(page_number, page_size)
        # return {"metadata": metadata, "movies": movies}
        return jsonify(movies)
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
