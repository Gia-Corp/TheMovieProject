from pydantic import BaseModel, ConfigDict


class UserDetailDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nickname: str
    email: str
    role: str
    profile_pic: str
