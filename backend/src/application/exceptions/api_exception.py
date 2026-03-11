from datetime import datetime


class ApiException(Exception):
    def __init__(self, parameter=None, payload=None):
        self.message = self.build_message(parameter)
        self.status_code = self.get_status_code()
        self.payload = payload
        super().__init__(self.message)

    def get_status_code(self):
        raise NotImplementedError

    def build_message(self, parameter):
        raise NotImplementedError

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        rv["timestamp"] = str(datetime.now())
        return rv
