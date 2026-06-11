from pydantic import BaseModel


class WatchedByDTO(BaseModel):
    watcher_users: int
    total_users: int
