from datetime import datetime


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
    status_code = 400

    def __init__(self, page_number, status_code=None, payload=None):
        self.message = f"{page_number} is not a valid page number"
        super().__init__(self.message)
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        rv["timestamp"] = str(datetime.now())
        return rv


class InvalidPageSizeError(Exception):
    status_code = 400

    def __init__(self, page_size, status_code=None, payload=None):
        self.message = f"{page_size} is not a valid page size"
        super().__init__(self.message)
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        rv["timestamp"] = str(datetime.now())
        return rv
