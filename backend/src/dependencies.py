from functools import lru_cache

import gspread
import src.settings as settings
from .infra import (
    GoogleSheetsMovieRepository,
    ExternalAPIMovieRepository,
    GoogleSheetsUserRepository,
    GoogleSheetsWatchEventRepository,
)
from .application.auth import JWTHandler
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer


@lru_cache
def _get_spreadsheet():
    client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
    return client.open(settings.SHEET_NAME)


@lru_cache
def get_movie_repo():
    return GoogleSheetsMovieRepository(_get_spreadsheet().get_worksheet(0))


@lru_cache
def get_external_api_movie_repo():
    return ExternalAPIMovieRepository(settings.MOVIE_API_URL, settings.MOVIE_API_KEY)


@lru_cache
def get_user_repo():
    return GoogleSheetsUserRepository(_get_spreadsheet().get_worksheet(1))


@lru_cache
def get_watch_event_repo():
    return GoogleSheetsWatchEventRepository(_get_spreadsheet().get_worksheet(2))


@lru_cache
def get_jwt_handler():
    return JWTHandler(
        settings.JWT_SECRET_KEY,
        settings.JWT_ALGORITHM,
        settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        settings.REFRESH_TOKEN_EXPIRE_DAYS,
    )


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    jwt_handler: JWTHandler = Depends(get_jwt_handler),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
):
    payload = jwt_handler.verify_token(token, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_repo.get_by_id(int(payload["sub"]))
