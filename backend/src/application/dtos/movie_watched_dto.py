from pydantic import BaseModel, Field, model_validator
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


class UserWatchedMoviesResponseDTO(BaseModel):
    metadata: WatchedMoviesMetadataDTO
    movies: list[MovieWatchedDTO]


class MovieWatchedItemDTO(BaseModel):
    movie_id: Optional[int] = Field(None, gt=0)
    title: Optional[str] = Field(None, min_length=1)
    watched: bool

    @model_validator(mode="after")
    def at_least_one_identifier(self) -> "MovieWatchedItemDTO":
        if self.movie_id is None and self.title is None:
            raise ValueError("Either movie_id or title must be provided")
        return self


class MovieWatchedSuccessDTO(BaseModel):
    movie_id: int
    title: str
    watched: bool
    watch_event_id: Optional[int] = None


class MovieWatchedErrorDTO(BaseModel):
    movie_id: Optional[int] = None
    title: str
    watched: bool
    error: str
    matches: Optional[list[str]] = None


class UpdateMoviesWatchedResponseDTO(BaseModel):
    success: list[MovieWatchedSuccessDTO]
    errors: list[MovieWatchedErrorDTO]
