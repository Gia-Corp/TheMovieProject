from gspread import utils
from src.application.exceptions import ApiException
from src.domain import Movie
import re


class GoogleSheetsMovieRepository:
    def __init__(self, sheet):
        self.sheet = sheet
        self._last_id = None

    def _get_next_id(self):
        if self._last_id is None:
            self._last_id = int(self.sheet.get("last_id")[0][0])
        self._last_id += 1
        return self._last_id

    # 2 CALLS
    def get_all_by_page(self, page):
        page_first_row = page.get_first_index() + 1
        page_last_row = page.get_last_index() + 1

        if self.last_row() < page_first_row:
            raise PageOutOfBoundsError

        rows = self.sheet.get(f"A{page_first_row}:G{page_last_row}")
        return self._movies_from_rows(rows)

    # 1 CALL
    def last_row(self):
        return len(self.sheet.col_values(1))

    def _movies_from_rows(self, rows):
        dicts = utils.to_records(
            [
                "director",
                "title",
                "year",
                "id",
                "runtime",
                "plot",
                "poster_url",
            ],
            rows,
        )
        return list(map(self._movie_from_dict, dicts))

    def _movie_from_dict(self, movie_dict):
        return Movie(
            id=int(movie_dict["id"]),
            title=movie_dict["title"],
            director=movie_dict["director"],
            year=int(movie_dict["year"]),
            plot=movie_dict["plot"] if "plot" in movie_dict else None,
            runtime=movie_dict["runtime"] if "runtime" in movie_dict else None,
            poster_url=movie_dict["poster_url"] if "poster_url" in movie_dict else None,
        )

    # 1 CALL
    def total_movies(self):
        return self.last_row() - 1

    # 2 CALLS
    def add(self, movie):
        next_id = self._get_next_id()

        movie_as_list = [
            movie.director,
            movie.title,
            movie.year,
            next_id,
            movie.runtime,
            movie.plot,
            movie.poster_url,
        ]
        self.sheet.append_row(movie_as_list)
        self.sheet.update([[next_id]], "last_id")
        movie.id = next_id
        return movie

    # 1 CALL
    def get_all(self):
        movies_dicts = self.sheet.get_all_records()
        return list(map(self._movie_from_dict, movies_dicts))

    # 1 CALL
    def get_by_id(self, id):
        movies = self.get_all()
        for movie in movies:
            if movie.id == id:
                return movie

        raise MovieNotFoundError()

    # 2 CALLS
    def save(self, movie):
        cell = self.sheet.find(str(movie.id), in_column=4)
        if not cell:
            return

        self.sheet.update(
            [
                [
                    movie.director,
                    movie.title,
                    movie.year,
                    movie.id,
                    movie.runtime,
                    movie.plot,
                    movie.poster_url,
                ]
            ],
            f"A{cell.row}:G{cell.row}",
        )
        return movie

    # 2 CALLS
    def delete(self, id):
        cell = self.sheet.find(str(id), in_column=4)
        if not cell:
            return
        self.sheet.delete_rows(cell.row)

    # 2 CALLS
    def find_by_title(self, title):
        cells = self.sheet.findall(re.compile(title, re.IGNORECASE), in_column=2)
        if not cells:
            return

        row_ranges = [f"A{cell.row}:G{cell.row}" for cell in cells]

        rows = self.sheet.batch_get(row_ranges)
        raw_movies = [row[0] for row in rows]
        movies = self._movies_from_rows(raw_movies)
        return movies

    # 1 CALL
    def exists_by_title(self, title):
        pattern = re.compile(r"^\s*" + re.escape(title) + r"\s*$", re.IGNORECASE)
        return self.sheet.findall(pattern, in_column=2)


class PageOutOfBoundsError(ApiException):
    NOT_FOUND = 400

    def build_message(self, parameter):
        return "Selected page is out of bounds"

    def get_status_code(self):
        return self.NOT_FOUND


class MovieNotFoundError(ApiException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "No movies found"

    def get_status_code(self):
        return self.NOT_FOUND


class MovieAlreadyExistsError(ApiException):
    CONFLICT = 409

    def build_message(self, parameter):
        return "Movie already exists"

    def get_status_code(self):
        return self.CONFLICT
