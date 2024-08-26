class MoviesPage:
    def __init__(self, number, size):
        if number < 1:
            raise InvalidPageNumberError(number)


class InvalidPageNumberError(Exception):
    def __init__(self, page_number):
        super().__init__(f"{page_number} is not a valid page number")
