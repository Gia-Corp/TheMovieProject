from controllers.movies_controller import movies_controller as movies
from flask import Flask, jsonify, request
from sheets import update_movie, add_movie
from flask_cors import CORS
import config

app = Flask(__name__)
CORS(app)
app.register_blueprint(movies)


@app.route("/")
def hello_world():
    return jsonify("Hello World!")


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
