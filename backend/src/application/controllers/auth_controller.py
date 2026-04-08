from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from src.dependencies import get_user_repo, get_jwt_handler
from src.infra import GoogleSheetsUserRepository
from src.application.auth import JWTHandler


auth_controller = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


@auth_controller.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    jwt_handler: JWTHandler = Depends(get_jwt_handler),
):
    user = user_repo.get_by_email(form_data.username)

    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    access_token = jwt_handler.create_access_token(
        {"sub": str(user.id), "role": user.role}
    )
    refresh_token = jwt_handler.create_refresh_token({"sub": str(user.id)})

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
