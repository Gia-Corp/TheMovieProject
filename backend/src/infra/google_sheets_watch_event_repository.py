from src.application.exceptions import ApiException


class GoogleSheetsWatchEventRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    def add(self, watch_event):
        cells_movie = self.sheet.findall(str(watch_event.movie_id), in_column=2)
        cells_user = self.sheet.findall(str(watch_event.user_id), in_column=3)

        rows_movie = {cell.row for cell in cells_movie}
        rows_user = {cell.row for cell in cells_user}
        already_exists = bool(rows_user & rows_movie)

        if already_exists:
            raise WatchEventAlreadyExistsError()

        last_id = int(self.sheet.get("last_watch_event_id")[0][0])
        next_id = last_id + 1

        watch_event_as_list = [
            next_id,
            watch_event.movie_id,
            watch_event.user_id,
            str(watch_event.watched_at),
        ]

        self.sheet.append_row(watch_event_as_list)
        self.sheet.update([[next_id]], "last_watch_event_id")
        watch_event.id = next_id
        return watch_event


class WatchEventAlreadyExistsError(ApiException):
    CONFLICT = 409

    def build_message(self, parameter):
        return "Watch event already exists"

    def get_status_code(self):
        return self.CONFLICT
