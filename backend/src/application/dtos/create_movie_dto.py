from pydantic import BaseModel


class CreateMovieDTO(BaseModel):
    title: str
    director: str
    year: int
    watched: bool
