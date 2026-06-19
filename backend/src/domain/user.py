from dataclasses import dataclass


@dataclass
class User:
    id: int
    nickname: str
    email: str
    hashed_password: str
    role: str
    profile_pic: str
