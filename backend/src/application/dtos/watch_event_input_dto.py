from pydantic import BaseModel


class WatchEventInputDTO(BaseModel):
    user_id: int
