from pydantic import BaseModel, Field
from typing import Optional


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
