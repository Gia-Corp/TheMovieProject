from src.application.exceptions import ApiException
from gspread import utils
from src.domain import WatchEvent
from datetime import datetime


class GoogleSheetsWatchEventRepository:
    def __init__(self, sheet):
        self.sheet = sheet

    # 2 CALLS
    def get_by_id(self, id):
        cell = self.sheet.find(str(id), in_column=1)
        if not cell:
            return

        raw_watch_events = self.sheet.get(f"A{cell.row}:D{cell.row}")
        watch_events = self._dicts_to_watch_events(raw_watch_events)
        return watch_events[0]

    # 1 CALL
    def get_all(self):
        raw_watch_events = self.sheet.get_all_records(
            expected_headers=["id", "movie_id", "user_id", "watched_at"]
        )
        return list(map(self._transform_into_watch_event, raw_watch_events))

    # 1 CALL
    def find_all_by_movies(self, movies):
        filas = self.sheet.get_all_records(
            expected_headers=["id", "movie_id", "user_id", "watched_at"]
        )
        ids = set([m.id for m in movies])
        raw_watch_events = [f for f in filas if f["movie_id"] in ids]
        return list(map(self._transform_into_watch_event, raw_watch_events))

    # 2 CALLS
    def find_by_movie_id(self, movie_id):
        cells = self.sheet.findall(str(movie_id), in_column=2)
        if not cells:
            return []

        row_ranges = [f"A{cell.row}:D{cell.row}" for cell in cells]

        rows = self.sheet.batch_get(row_ranges)
        raw_watch_events = [row[0] for row in rows]
        return self._dicts_to_watch_events(raw_watch_events)

    # 2 CALLS
    def find_by_user_id(self, user_id):
        cells = self.sheet.findall(str(user_id), in_column=3)
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

    # 5 CALLS
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

    # MIN = 1 CALL, MAX = N + 2 CALLS
    def add_many(self, watch_events):
        last_id = int(self.sheet.get("last_watch_event_id")[0][0])
        next_id = None

        for watch_event in watch_events:
            next_id = last_id + 1
            watch_event_as_list = [
                next_id,
                watch_event.movie_id,
                watch_event.user_id,
                str(watch_event.watched_at),
            ]

            self.sheet.append_row(watch_event_as_list)
            watch_event.id = next_id
            last_id = next_id

        if next_id:
            self.sheet.update([[next_id]], "last_watch_event_id")

    # 2 CALLS
    def delete(self, id):
        cell = self.sheet.find(str(id), in_column=1)
        if not cell:
            return
        self.sheet.delete_rows(cell.row)

    # 2 CALLS
    def delete_by_movie_id(self, movie_id):
        cells = self.sheet.findall(str(movie_id), in_column=2)
        if not cells:
            return cells

        rows_to_delete = [cell.row for cell in cells]
        requests = [
            {
                "deleteDimension": {
                    "range": {
                        "sheetId": self.sheet.id,
                        "dimension": "ROWS",
                        "startIndex": i - 1,
                        "endIndex": i,
                    }
                }
            }
            for i in sorted(rows_to_delete, reverse=True)
        ]
        self.sheet.spreadsheet.batch_update({"requests": requests})

    # 2 CALLS
    def delete_by_movie_and_user_ids(self, movie_id, user_ids):
        filas = self.sheet.get_all_records(expected_headers=["user_id", "movie_id"])
        ids = {str(id) for id in user_ids}
        rows_to_delete = [
            i + 2
            for i, f in enumerate(filas)
            if str(f["movie_id"]) == str(movie_id) and str(f["user_id"]) in ids
        ]

        if not rows_to_delete:
            return

        requests = [
            {
                "deleteDimension": {
                    "range": {
                        "sheetId": self.sheet.id,
                        "dimension": "ROWS",
                        "startIndex": i - 1,
                        "endIndex": i,
                    }
                }
            }
            for i in sorted(rows_to_delete, reverse=True)
        ]
        self.sheet.spreadsheet.batch_update({"requests": requests})


class WatchEventNotFoundError(ApiException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "Watch event not found"

    def get_status_code(self):
        return self.NOT_FOUND


class WatchEventAlreadyExistsError(ApiException):
    CONFLICT = 409

    def build_message(self, parameter):
        return "Watch event already exists"

    def get_status_code(self):
        return self.CONFLICT
