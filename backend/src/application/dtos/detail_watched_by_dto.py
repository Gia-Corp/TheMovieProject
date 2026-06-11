from pydantic import BaseModel
from .detail_watch_event_dto import DetailWatchEventDTO


class DetailWatchedByDTO(BaseModel):
    watch_events: list[DetailWatchEventDTO]
    watcher_users: int
    total_users: int
