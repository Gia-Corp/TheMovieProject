from flask import Flask,render_template, jsonify, request, redirect, url_for, send_file
from sheets import update_movie, add_movie
from google_sheet_connector import GoogleSheetConnector
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello_world():
    return jsonify("Hello World!")

"""
{
    title: The Big Short,
    director: Adam McKay,
    watched: True/False
}
"""

@app.route("/movies")
def get_movies():
    try:
        movies = GoogleSheetConnector().get_movies(5)
        return jsonify(movies)
    except(Exception) as err:
        return str(err), 500

@app.route("/update", methods=['POST'])
def update():
    try:
        id = request.json ["id"]
        title = request.json ["title"]
        director = request.json ["director"]
        watched = request.json ["watched"]
        
        update_movie(id,title,director,watched)
        
        return 'Success'
    except (Exception) as err:
        return str(err), 500
    
@app.route("/add", methods=['POST'])
def add():
    try:
        title = request.json ["title"]
        director = request.json ["director"]
        watched = request.json ["watched"]
        
        add_movie (title,director,watched)
        
        return 'Success'
    except (Exception) as err:
        return str(err), 500

if __name__ == '__main__':
    app.run(host='backend', port='5000', debug=True)