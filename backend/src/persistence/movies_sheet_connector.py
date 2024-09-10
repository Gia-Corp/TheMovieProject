from gspread import utils


class MoviesSheetConnector:
    def __init__(self, sheet):
        self.sheet = sheet

    def get_movies_by_page(self, page):
        page_first_row = page.get_first_index() + 1
        page_last_row = page.get_last_index() + 1

        if self.next_available_row() <= page_first_row:
            raise PageOutOfBoundsError

        raw_movies = self.sheet.get(f"A{page_first_row}:E{page_last_row }")
        raw_movies = utils.to_records(
            ["director", "title", "year", "watched", "id"], raw_movies
        )
        movies = list(map(self.transform_into_movie, raw_movies))
        return movies

    def next_available_row(self):
        return len(list(filter(None, self.sheet.col_values(1)))) + 1

    def transform_into_movie(self, raw_movie):
        raw_movie["watched"] = True if raw_movie["watched"] == "TRUE" else False
        raw_movie["year"] = int(raw_movie["year"])
        raw_movie["id"] = int(raw_movie["id"])
        return raw_movie

    def get_movie_count(self):
        return self.next_available_row() - 2


class PageOutOfBoundsError(Exception):
    def __init__(self):
        super().__init__("Selected page is out of bounds")
