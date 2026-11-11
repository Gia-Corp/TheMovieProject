import logging
import re
import time

from gspread import utils
from src.application.exceptions import APIException
from src.domain import Movie

logger = logging.getLogger("api.db")


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

        start_time = time.perf_counter()
        try:
            rows = self.sheet.get(f"A{page_first_row}:G{page_last_row}")
            logger.info(
                "db_operation",
                extra={
                    "operation": "get_all_by_page",
                    "sheet": "movies",
                    "rows": len(rows),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return self._movies_from_rows(rows)
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "get_all_by_page",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

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
            title=str(movie_dict["title"]),
            director=movie_dict["director"],
            year=int(movie_dict["year"]),
            plot=movie_dict["plot"] if "plot" in movie_dict else None,
            runtime=movie_dict["runtime"] if "runtime" in movie_dict else None,
            poster_url=movie_dict["poster_url"] if "poster_url" in movie_dict else None,
        )

    def _movie_to_list(self, movie):
        return [
            movie.director,
            movie.title,
            movie.year,
            movie.id,
            movie.runtime,
            movie.plot,
            movie.poster_url,
        ]

    # 1 CALL
    def total_movies(self):
        start_time = time.perf_counter()
        try:
            total_movies = self.last_row() - 1
            logger.info(
                "db_operation",
                extra={
                    "operation": "total_movies",
                    "sheet": "movies",
                    "rows": total_movies,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return total_movies
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "total_movies",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 2 CALLS
    def add(self, movie):
        start_time = time.perf_counter()
        try:
            movie.id = self._get_next_id()
            movie_as_list = self._movie_to_list(movie)
            self.sheet.append_row(movie_as_list)
            self.sheet.update([[movie.id]], "last_id")
            logger.info(
                "db_operation",
                extra={
                    "operation": "add",
                    "sheet": "movies",
                    "rows": 1,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return movie
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "add",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 1 CALL
    def get_all(self):
        movies_dicts = self.sheet.get_all_records(
            expected_headers=[
                "director",
                "title",
                "year",
                "id",
                "runtime",
                "plot",
                "poster_url",
            ]
        )
        return list(map(self._movie_from_dict, movies_dicts))

    # 1 CALL
    def get_by_id(self, id):
        start_time = time.perf_counter()
        try:
            movies = self.get_all()
            movie = next((m for m in movies if m.id == id), None)
            if movie is None:
                raise MovieNotFoundError()

            logger.info(
                "db_operation",
                extra={
                    "operation": "get_by_id",
                    "sheet": "movies",
                    "rows": len(movies),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return movie
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "get_by_id",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 2 CALLS
    def save(self, movie):
        start_time = time.perf_counter()
        try:
            cell = self.sheet.find(str(movie.id), in_column=4)
            if not cell:
                raise MovieNotFoundError()

            self.sheet.update(
                [self._movie_to_list(movie)],
                f"A{cell.row}:G{cell.row}",
            )
            logger.info(
                "db_operation",
                extra={
                    "operation": "save",
                    "sheet": "movies",
                    "rows": 1,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return movie
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "save",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 2 CALLS
    def delete(self, id):
        start_time = time.perf_counter()
        try:
            cell = self.sheet.find(str(id), in_column=4)
            if not cell:
                raise MovieNotFoundError()

            self.sheet.delete_rows(cell.row)
            logger.info(
                "db_operation",
                extra={
                    "operation": "delete",
                    "sheet": "movies",
                    "rows": 1,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "delete",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 1 CALL
    def get_all_by_title(self, title):
        start_time = time.perf_counter()
        try:
            movies = self.get_all()
            filtered_movies = [m for m in movies if title.lower() in m.title.lower()]

            if not filtered_movies:
                raise MovieNotFoundError()

            logger.info(
                "db_operation",
                extra={
                    "operation": "get_all_by_title",
                    "sheet": "movies",
                    "rows": len(movies),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return filtered_movies
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "get_all_by_title",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise

    # 1 CALL
    def exists_by_title(self, title):
        pattern = re.compile(r"^\s*" + re.escape(title) + r"\s*$", re.IGNORECASE)
        start_time = time.perf_counter()
        try:
            existing_movies = self.sheet.findall(pattern, in_column=2)
            logger.info(
                "db_operation",
                extra={
                    "operation": "exists_by_title",
                    "sheet": "movies",
                    "rows": len(existing_movies),
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return existing_movies
        except Exception:
            logger.exception(
                "db_operation_failed",
                extra={
                    "operation": "exists_by_title",
                    "sheet": "movies",
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise


class PageOutOfBoundsError(APIException):
    NOT_FOUND = 400

    def build_message(self, parameter):
        return "Selected page is out of bounds"

    def get_status_code(self):
        return self.NOT_FOUND


class MovieNotFoundError(APIException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "No movies found"

    def get_status_code(self):
        return self.NOT_FOUND


class MovieAlreadyExistsError(APIException):
    CONFLICT = 409

    def build_message(self, parameter):
        return "Movie already exists"

    def get_status_code(self):
        return self.CONFLICT
