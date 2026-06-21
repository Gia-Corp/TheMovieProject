from pydantic import BaseModel
from .user_summary_dto import UserSummaryDTO


class AuthResponseDTO(BaseModel):
    access_token: str
    token_type: str
    user: UserSummaryDTO
