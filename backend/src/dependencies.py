import gspread
import src.settings as settings
from .infra import (
    GoogleSheetsMovieRepository,
    ExternalAPIMovieRepository,
    GoogleSheetsUserRepository,
)

client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
spreadsheet = client.open(settings.SHEET_NAME)
movies_sheet = spreadsheet.get_worksheet(0)
movie_repo = GoogleSheetsMovieRepository(movies_sheet)
external_api_movie_repo = ExternalAPIMovieRepository(
    settings.MOVIE_API_URL, settings.MOVIE_API_KEY
)

users_sheet = spreadsheet.get_worksheet(1)
user_repo = GoogleSheetsUserRepository(users_sheet)


def get_movie_repo():
    return movie_repo


def get_external_api_movie_repo():
    return external_api_movie_repo


def get_user_repo():
    return user_repo
