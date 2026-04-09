from fastapi import APIRouter, Depends, Response, HTTPException, Cookie
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


@auth_controller.post("/refresh")
async def refresh(
    refresh_token: str = Cookie(None),
    jwt_handler: JWTHandler = Depends(get_jwt_handler),
):
    if not refresh_token:
        raise HTTPException(status_code=401)

    payload = jwt_handler.verify_token(refresh_token, "refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")

    new_access_token = jwt_handler.create_access_token(
        {"sub": payload["sub"], "role": payload["role"]}
    )
    return {"access_token": new_access_token, "token_type": "bearer"}


@auth_controller.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Sesión cerrada"}
