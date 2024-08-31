class MoviesPage:
    DEFAULT_NUMBER = 1
    DEFAULT_SIZE = 10
    MINIMUM_NUMBER = 1
    MINIMUM_SIZE = 1

    def __init__(self, number=DEFAULT_NUMBER, size=DEFAULT_SIZE):
        if number < self.MINIMUM_NUMBER:
            raise InvalidPageNumberError(number)
        if size < self.MINIMUM_SIZE:
            raise InvalidPageSizeError(size)

        self.number = number
        self.size = size

    def get_first_index(self):
        return (self.number * self.size) - self.size + 1

    def get_last_index(self):
        return self.number * self.size


class InvalidPageNumberError(Exception):
    def __init__(self, page_number):
        super().__init__(f"{page_number} is not a valid page number")


class InvalidPageSizeError(Exception):
    def __init__(self, page_size):
        super().__init__(f"{page_size} is not a valid page size")
