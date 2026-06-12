from src.application.exceptions import ApiException
from gspread import utils
from src.domain import WatchEvent
from datetime import datetime


class GoogleSheetsWatchEventRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    def find_by_movie_id(self, movie_id):
        cells = self.sheet.findall(str(movie_id), in_column=2)
        if not cells:
            return []

        row_ranges = [f"A{cell.row}:D{cell.row}" for cell in cells]

        rows = self.sheet.batch_get(row_ranges)
        raw_watch_events = [row[0] for row in rows]
        return self._dicts_to_watch_events(raw_watch_events)

    def _dicts_to_watch_events(self, dicts):
        raw_watch_events = utils.to_records(
            ["id", "movie_id", "user_id", "watched_at"],
            dicts,
        )
        return list(map(self._transform_into_watch_event, raw_watch_events))

    def _transform_into_watch_event(self, raw_watch_event):
        return WatchEvent(
            id=int(raw_watch_event["id"]),
            user_id=int(raw_watch_event["user_id"]),
            movie_id=int(raw_watch_event["movie_id"]),
            watched_at=datetime.strptime(
                raw_watch_event["watched_at"], "%Y-%m-%d %H:%M:%S.%f"
            ),
        )

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
