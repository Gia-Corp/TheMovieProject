class MoviesPage:
    def __init__(self, number, size):
        if number < 1:
            raise InvalidPageNumberError(number)
        if size < 1:
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
