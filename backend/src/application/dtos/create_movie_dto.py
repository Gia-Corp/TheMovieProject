from pydantic import BaseModel
from typing import Optional


class CreateMovieDTO(BaseModel):
    title: str
    year: int
    watched_by: list[int] = []
    genre: Optional[str] = None
