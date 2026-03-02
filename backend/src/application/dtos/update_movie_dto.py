from pydantic import BaseModel, Field
from typing import Optional


class UpdateMovieDTO(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    director: Optional[str] = Field(None, min_length=1)
    year: Optional[int] = Field(None, ge=0)
    watched: Optional[bool] = None
