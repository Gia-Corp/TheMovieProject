from src.application.exceptions import APIException
from src.domain import WatchEvent
from datetime import datetime


class GoogleSheetsWatchEventRepository:
    def __init__(self, sheet):
        self.sheet = sheet
        self._last_id = None

    def _get_next_id(self):
        if self._last_id is None:
            self._last_id = int(self.sheet.get("last_watch_event_id")[0][0])
        self._last_id += 1
        return self._last_id

    # 1 CALL
    def get_by_id(self, id):
        watch_events = self.get_all()
        for we in watch_events:
            if we.id == id:
                return we

        raise WatchEventNotFoundError()

    # 1 CALL
    def get_all(self):
        watch_event_dicts = self.sheet.get_all_records(
            expected_headers=["id", "movie_id", "user_id", "watched_at"]
        )
        return list(map(self._watch_event_from_dict, watch_event_dicts))

    # 1 CALL
    def get_all_by_movies(self, movies):
        ids = set([m.id for m in movies])
        watch_events = self.get_all()
        return [we for we in watch_events if we.movie_id in ids]

    # 1 CALL
    def get_all_by_movie_id(self, movie_id):
        watch_events = self.get_all()
        return [we for we in watch_events if we.movie_id == movie_id]

    # 1 CALL
    def get_all_by_user_id(self, user_id):
        watch_events = self.get_all()
        return [we for we in watch_events if we.user_id == user_id]

    def _watch_event_from_dict(self, watch_event_dict):
        return WatchEvent(
            id=int(watch_event_dict["id"]),
            user_id=int(watch_event_dict["user_id"]),
            movie_id=int(watch_event_dict["movie_id"]),
            watched_at=datetime.strptime(
                watch_event_dict["watched_at"], "%Y-%m-%d %H:%M:%S.%f"
            ),
        )

    def _watch_event_to_list(self, watch_event):
        return [
            watch_event.id,
            watch_event.movie_id,
            watch_event.user_id,
            str(watch_event.watched_at),
        ]

    # 3 CALLS
    def add(self, watch_event):
        watch_events = self.get_all()
        already_exists = any(
            we.movie_id == watch_event.movie_id and we.user_id == watch_event.user_id
            for we in watch_events
        )

        if already_exists:
            raise WatchEventAlreadyExistsError()

        watch_event.id = self._get_next_id()
        watch_event_as_list = self._watch_event_to_list(watch_event)
        self.sheet.append_row(watch_event_as_list)
        self.sheet.update([[watch_event.id]], "last_watch_event_id")
        return watch_event

    # 2 CALLS (3 en el primer add_many)
    def add_many(self, watch_events):
        if not watch_events:
            return

        rows = []
        for watch_event in watch_events:
            watch_event.id = self._get_next_id()
            rows.append(self._watch_event_to_list(watch_event))

        self.sheet.append_rows(rows)
        self.sheet.update([[self._last_id]], "last_watch_event_id")

    # 2 CALLS
    def delete(self, id):
        cell = self.sheet.find(str(id), in_column=1)
        if not cell:
            raise WatchEventNotFoundError()
        self.sheet.delete_rows(cell.row)

    # 2 CALLS
    def delete_by_movie_id(self, movie_id):
        cells = self.sheet.findall(str(movie_id), in_column=2)
        if not cells:
            return

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
        rows = self.sheet.get_all_records(
            expected_headers=["id", "movie_id", "user_id", "watched_at"]
        )
        ids = {str(id) for id in user_ids}
        rows_to_delete = [
            i + 2
            for i, f in enumerate(rows)
            if str(f["movie_id"]) == str(movie_id) and str(f["user_id"]) in ids
        ]

        if not rows_to_delete:
            raise WatchEventNotFoundError()

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


class WatchEventNotFoundError(APIException):
    NOT_FOUND = 404

    def build_message(self, parameter):
        return "Watch event not found"

    def get_status_code(self):
        return self.NOT_FOUND


class WatchEventAlreadyExistsError(APIException):
    CONFLICT = 409

    def build_message(self, parameter):
        return "Watch event already exists"

    def get_status_code(self):
        return self.CONFLICT
