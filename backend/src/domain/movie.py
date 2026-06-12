from src.application.exceptions import ApiException
from dataclasses import dataclass
from typing import Optional


@dataclass
class Movie:
    id: int
    title: str
    director: str
    year: int
    runtime: Optional[str] = None
    plot: Optional[str] = None
    poster_url: Optional[str] = None

    def __post_init__(self):
        self.validate()

    def validate(self):
        if self.year < 0:
            raise NegativeMovieYearError(self.year)
        if not self.title:
            raise EmptyMovieTitleError()
        if not self.director:
            raise EmptyMovieDirectorError()


class EmptyMovieDirectorError(ApiException):
    BAD_REQUEST = 400

    def build_message(self, _):
        return "Movie director cannot be empty"

    def get_status_code(self):
        return self.BAD_REQUEST


class EmptyMovieTitleError(ApiException):
    BAD_REQUEST = 400

    def build_message(self, _):
        return "Movie title cannot be empty"

    def get_status_code(self):
        return self.BAD_REQUEST


class NegativeMovieYearError(ApiException):
    BAD_REQUEST = 400

    def build_message(self, movie_year):
        return f"Movie year cannot be negative: {movie_year}"

    def get_status_code(self):
        return self.BAD_REQUEST
