from pydantic import BaseModel
from .user_summary_dto import UserSummaryDTO
from datetime import datetime


class DetailWatchEventDTO(BaseModel):
    user: UserSummaryDTO
    watched_at: datetime
