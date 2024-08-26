from flask import Flask, jsonify, request
from google_sheet_connector import GoogleSheetConnector
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
        page_number = request.args.get("page_number")
        page_size = request.args.get("page_size")
        movies = GoogleSheetConnector(sheet).get_movies_by_page(page_number, page_size)
        return jsonify(movies)
    # Handle different exceptions in an elegant way!
    except Exception as err:
        return str(err), 500


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
