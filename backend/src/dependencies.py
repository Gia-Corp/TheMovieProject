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

client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
spreadsheet = client.open(settings.SHEET_NAME)
movies_sheet = spreadsheet.get_worksheet(0)
watch_events_sheet = spreadsheet.get_worksheet(2)

watch_event_repo = GoogleSheetsWatchEventRepository(watch_events_sheet)
movie_repo = GoogleSheetsMovieRepository(movies_sheet)

external_api_movie_repo = ExternalAPIMovieRepository(
    settings.MOVIE_API_URL, settings.MOVIE_API_KEY
)

users_sheet = spreadsheet.get_worksheet(1)
user_repo = GoogleSheetsUserRepository(users_sheet)


jwt_handler = JWTHandler(
    settings.JWT_SECRET_KEY,
    settings.JWT_ALGORITHM,
    settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    settings.REFRESH_TOKEN_EXPIRE_DAYS,
)


def get_movie_repo():
    return movie_repo


def get_external_api_movie_repo():
    return external_api_movie_repo


def get_user_repo():
    return user_repo


def get_watch_event_repo():
    return watch_event_repo


def get_jwt_handler():
    return jwt_handler


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt_handler.verify_token(token, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_repo.get_by_id(payload["sub"])
