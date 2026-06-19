from pydantic import BaseModel, ConfigDict


class UserSummaryDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nickname: str
    profile_pic: str
