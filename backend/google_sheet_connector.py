from gspread import utils


class GoogleSheetConnector:
    DEFAULT_PAGE_NUMBER = 1
    DEFAULT_PAGE_SIZE = 10

    def __init__(self, sheet):
        self.sheet = sheet

    def get_movies_by_page(self, page_number, page_size):
        page_number = self.DEFAULT_PAGE_NUMBER if not page_number else int(page_number)
        page_size = self.DEFAULT_PAGE_SIZE if not page_size else int(page_size)

        if page_number < 1:
            raise InvalidPageNumberError(page_number)
        if page_size < 1:
            raise InvalidPageSizeError(page_size)

        page_first_row = ((page_number * page_size) - (page_size - 1)) + 1
        page_last_row = (page_number * page_size) + 1

        raw_movies = self.sheet.get(f"A{page_first_row}:D{page_last_row }")
        raw_movies = utils.to_records(
            ["director", "title", "year", "watched"], raw_movies
        )
        movies = list(map(self.transform_into_movie, raw_movies))
        return movies

    def transform_into_movie(self, raw_movie):
        raw_movie["watched"] = True if raw_movie["watched"] == "TRUE" else False
        raw_movie["year"] = int(raw_movie["year"])
        return raw_movie


class InvalidPageNumberError(Exception):
    def __init__(self, page_number):
        super().__init__(f"{page_number} is not a valid page number")


class InvalidPageSizeError(Exception):
    def __init__(self, page_size):
        super().__init__(f"{page_size} is not a valid page size")
