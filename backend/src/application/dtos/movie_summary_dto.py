from pydantic import BaseModel


class MovieSummaryDTO(BaseModel):
    id: int
    poster_url: str | None
    watched: bool
