from pydantic import BaseModel
from .watch_event_input_dto import WatchEventInputDTO


class CreateMovieDTO(BaseModel):
    title: str
    year: int
    watched_by: list[WatchEventInputDTO] = []
