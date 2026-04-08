from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
import bcrypt
from src.dependencies import get_user_repo
from src.infra import GoogleSheetsUserRepository

auth_controller = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


JWT_SECRET_KEY = (
    "tu-clave-secreta-muy-larga"
)
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {**data, "exp": expire, "type": "access"}, JWT_SECRET_KEY, JWT_ALGORITHM
    )


def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {**data, "exp": expire, "type": "refresh"}, JWT_SECRET_KEY, JWT_ALGORITHM
    )


def verify_token(token: str, token_type: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


@auth_controller.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
):
    user = user_repo.get_by_email(form_data.username)

    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Refresh token en cookie HttpOnly
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    return {"access_token": access_token, "token_type": "bearer"}
