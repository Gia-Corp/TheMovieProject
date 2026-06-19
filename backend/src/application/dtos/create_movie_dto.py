from pydantic import BaseModel


class CreateMovieDTO(BaseModel):
    title: str
    year: int
    watched_by: list[int] = []
