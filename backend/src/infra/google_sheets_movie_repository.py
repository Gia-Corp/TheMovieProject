from gspread import utils
from src.application.exceptions import ApiException
from src.domain import Movie
import re


class GoogleSheetsMovieRepository:
    def __init__(self, movies_sheet, watch_events_sheet):
        self.movies_sheet = movies_sheet
        self.watch_events_sheet = watch_events_sheet

    def get_movies_by_page(self, page):
        page_first_row = page.get_first_index() + 1
        page_last_row = page.get_last_index() + 1

        if self._next_available_row() <= page_first_row:
            raise PageOutOfBoundsError

        raw_movies = self.movies_sheet.get(f"A{page_first_row}:G{page_last_row}")
        movies = self._dicts_to_movies(raw_movies)
        return movies

    def _next_available_row(self):
        return len(list(filter(None, self.movies_sheet.col_values(1)))) + 1

    def _dicts_to_movies(self, dicts):
        raw_movies = utils.to_records(
            [
                "director",
                "title",
                "year",
                "id",
                "runtime",
                "plot",
                "poster_url",
            ],
            dicts,
        )
        return list(map(self._transform_into_movie, raw_movies))

    def _transform_into_movie(self, raw_movie):
        movie = Movie(
            id=int(raw_movie["id"]),
            title=raw_movie["title"],
            director=raw_movie["director"],
            year=int(raw_movie["year"]),
            plot=raw_movie["plot"] if "plot" in raw_movie else None,
            runtime=raw_movie["runtime"] if "runtime" in raw_movie else None,
            poster_url=raw_movie["poster_url"] if "poster_url" in raw_movie else None,
        )
        return movie

    def get_movie_count(self):
        return self._next_available_row() - 2

    def add(self, movie):
        last_id = int(self.movies_sheet.get("last_id")[0][0])
        next_id = last_id + 1

        movie_as_list = [
            movie.director,
            movie.title,
            movie.year,
            False,
            next_id,
            movie.runtime,
            movie.plot,
            movie.poster_url,
        ]
        self.movies_sheet.append_row(movie_as_list)
        self.movies_sheet.update([[next_id]], "last_id")
        movie.id = next_id

        # self._save_watch_events(movie)

        return movie

    # def _save_watch_events(self, movie):
    #     last_id = int(self.watch_events_sheet.get("last_watch_event_id")[0][0])
    #     next_id = None

    #     # if not movie.watched_by:
    #     #     cells = self.watch_events_sheet.findall(str(movie.id), in_column=2)
    #     #     if cells:
    #     #         rows_to_delete = [cell.row for cell in cells]
    #     #         requests = [
    #     #             {"deleteDimension": {"range": {"sheetId": self.watch_events_sheet.id, "dimension": "ROWS", "startIndex": i - 1, "endIndex": i}}}
    #     #             for i in sorted(rows_to_delete, reverse=True)
    #     #         ]
    #     #         self.watch_events_sheet.spreadsheet.batch_update({"requests": requests})

    #     for watch_event in movie.watched_by:
    #         if watch_event.id:
    #             continue

    #         next_id = last_id + 1
    #         watch_event_as_list = [
    #             next_id,
    #             movie.id,
    #             watch_event.user_id,
    #             str(watch_event.watched_at),
    #         ]

    #         self.watch_events_sheet.append_row(watch_event_as_list)
    #         watch_event.id = next_id
    #         last_id = next_id

    #     if next_id:
    #         self.watch_events_sheet.update([[next_id]], "last_watch_event_id")

    def get_by_id(self, id):
        cell = self.movies_sheet.find(str(id), in_column=4)
        if not cell:
            return

        raw_movies = self.movies_sheet.get(f"A{cell.row}:G{cell.row}")
        movies = self._dicts_to_movies(raw_movies)
        return movies[0]

    def save(self, movie):
        cell = self.movies_sheet.find(str(movie.id), in_column=4)
        if not cell:
            return

        self.movies_sheet.update(
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

    def delete(self, id):
        cell = self.movies_sheet.find(str(id), in_column=4)
        if not cell:
            return
        self.movies_sheet.delete_rows(cell.row)

        cells = self.watch_events_sheet.findall(str(id), in_column=2)
        if cells:
            rows_to_delete = [cell.row for cell in cells]
            requests = [
                {
                    "deleteDimension": {
                        "range": {
                            "sheetId": self.watch_events_sheet.id,
                            "dimension": "ROWS",
                            "startIndex": i - 1,
                            "endIndex": i,
                        }
                    }
                }
                for i in sorted(rows_to_delete, reverse=True)
            ]
            self.watch_events_sheet.spreadsheet.batch_update({"requests": requests})

    def find_by_title(self, title):
        cells = self.movies_sheet.findall(re.compile(title, re.IGNORECASE), in_column=2)
        if not cells:
            return

        row_ranges = [f"A{cell.row}:G{cell.row}" for cell in cells]

        rows = self.movies_sheet.batch_get(row_ranges)
        raw_movies = [row[0] for row in rows]
        movies = self._dicts_to_movies(raw_movies)
        return movies

    def exists_by_title(self, title):
        pattern = re.compile(r"^\s*" + re.escape(title) + r"\s*$", re.IGNORECASE)
        return self.movies_sheet.findall(pattern, in_column=2)


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
