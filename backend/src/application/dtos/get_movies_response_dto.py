from .movie_summary_dto import MovieSummaryDTO
from pydantic import BaseModel


class GetMoviesResponseDTO(BaseModel):
    metadata: dict
    movies: list[MovieSummaryDTO]
