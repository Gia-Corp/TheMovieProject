from controllers.movies_controller import movies
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.register_blueprint(movies)


@app.route("/")
def hello_world():
    return jsonify("Hello World!")
