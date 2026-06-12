from pydantic import BaseModel


class CreateWatchEventDTO(BaseModel):
    movie_id: int
    user_id: int
