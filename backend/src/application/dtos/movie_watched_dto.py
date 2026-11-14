from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MovieWatchedDTO(BaseModel):
    movie_id: int
    title: str
    year: int
    poster_url: str | None = None
    watched_at: datetime


class WatchedMoviesMetadataDTO(BaseModel):
    movie_count: int
    movies_watched: int
    last_watched: MovieWatchedDTO | None = None


class UserWatchedMoviesResponseDTO(BaseModel):
    metadata: WatchedMoviesMetadataDTO
    movies: list[MovieWatchedDTO]


class MovieWatchedItemDTO(BaseModel):
    movie_id: int = Field(..., gt=0)
    watched: bool


class MovieWatchedSuccessDTO(BaseModel):
    movie_id: int
    watched: bool
    watch_event_id: Optional[int] = None


class MovieWatchedErrorDTO(BaseModel):
    movie_id: int
    watched: bool
    error: str


class UpdateMoviesWatchedResponseDTO(BaseModel):
    success: list[MovieWatchedSuccessDTO]
    errors: list[MovieWatchedErrorDTO]
