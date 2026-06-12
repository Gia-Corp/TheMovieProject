from pydantic import BaseModel, Field
from typing import Optional


class UpdateMovieDTO(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    director: Optional[str] = Field(None, min_length=1)
    year: Optional[int] = Field(None, ge=0)
    runtime: Optional[str] = Field(None, min_length=1)
    plot: Optional[str] = Field(None, min_length=1)
    poster_url: Optional[str] = Field(None, min_length=1)
