from jose import JWTError, jwt
from datetime import datetime, timedelta


class JWTHandler:
    def __init__(
        self,
        secret_key,
        hash_algorithm,
        access_token_expire_minutes,
        refresh_token_expire_days,
    ):
        self.secret_key = secret_key
        self.hash_algorithm = hash_algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_days = refresh_token_expire_days

    def create_access_token(self, data: dict):
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        return jwt.encode(
            {**data, "exp": expire, "type": "access"},
            self.secret_key,
            self.hash_algorithm,
        )

    def create_refresh_token(self, data: dict):
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        return jwt.encode(
            {**data, "exp": expire, "type": "refresh"},
            self.secret_key,
            self.hash_algorithm,
        )

    def verify_token(self, token: str, token_type: str):
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[self.hash_algorithm]
            )
            if payload.get("type") != token_type:
                return None
            return payload
        except JWTError:
            return None
