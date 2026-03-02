from fastapi import APIRouter, Query, Depends
from src.infra import GoogleSheetsMovieRepository
from src.application.pagination import MoviesPage, PageMetadataCalculator
from src.domain import Movie
from src.dependencies import get_movie_repo
from src.application.dtos import CreateMovieDTO

movies_controller = APIRouter(
    tags=["Movies"],
)


@movies_controller.get("/movies")
async def get_movies(
    page: int = Query(..., gt=0),
    size: int = Query(..., gt=0),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    page_obj = MoviesPage(page, size)
    movies = movie_repo.get_movies_by_page(page_obj)
    movie_count = movie_repo.get_movie_count()
    metadata = PageMetadataCalculator().calculate(page_obj, movie_count, "/movies")

    return {"metadata": metadata, "movies": movies}


@movies_controller.post("/movies")
async def create_movie(
    movie_dto: CreateMovieDTO,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
):
    movie = Movie(
        movie_dto.title,
        movie_dto.director,
        movie_dto.year,
        movie_dto.watched,
    )
    movie_repo.add_movie(movie)
    return {"message": "Successful!"}


# @movies_controller.patch("/movies/<id>")
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
