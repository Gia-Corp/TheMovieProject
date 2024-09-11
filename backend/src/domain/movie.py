from exceptions.api_exception import ApiException


class Movie:
    def __init__(self, title, director, year, watched):
        if year < 0:
            raise NegativeMovieYearError(year)
        if not title:
            raise EmptyMovieTitleError
        if not director:
            raise EmptyMovieDirectorError
        return


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
