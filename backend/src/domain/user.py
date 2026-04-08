from dataclasses import dataclass


@dataclass
class User:
    id: int
    email: str
    hashed_password: str
    role: str
