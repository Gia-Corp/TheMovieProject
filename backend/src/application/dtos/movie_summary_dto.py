from pydantic import BaseModel
from .watched_by_dto import WatchedByDTO


class MovieSummaryDTO(BaseModel):
    id: int
    title: str
    year: int
    genre: str | None
    poster_url: str | None
    watched_by: WatchedByDTO
