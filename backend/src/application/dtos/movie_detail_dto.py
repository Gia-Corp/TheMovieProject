from pydantic import BaseModel
from .detail_watched_by_dto import DetailWatchedByDTO


class MovieDetailDTO(BaseModel):
    id: int
    title: str
    director: str
    year: int
    runtime: str | None
    plot: str | None
    poster_url: str | None
    watched_by: DetailWatchedByDTO
