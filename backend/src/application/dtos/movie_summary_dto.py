from pydantic import BaseModel


class MovieSummaryDTO(BaseModel):
    id: int
    title: str
    year: int
    poster_url: str | None
    watched: bool
