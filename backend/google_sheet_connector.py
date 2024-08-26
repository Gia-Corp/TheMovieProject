from gspread import utils


class GoogleSheetConnector:
    def __init__(self, sheet):
        self.sheet = sheet

    def get_movies_by_page(self, page_number, page_size):
        page_first_row = 4
        page_last_row = 5
        raw_movies = self.sheet.get(f"A{page_first_row}:D{page_last_row }")
        raw_movies = utils.to_records(
            ["director", "title", "year", "watched"], raw_movies
        )
        movies = list(map(self.transform_into_movie, raw_movies))
        return movies

    def transform_into_movie(self, raw_movie):
        raw_movie["watched"] = True if raw_movie["watched"] == "TRUE" else False
        return raw_movie
