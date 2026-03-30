import gspread
import src.settings as settings
from .infra import GoogleSheetsMovieRepository, ExternalAPIMovieRepository

client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
movies_sheet = client.open(settings.SHEET_NAME).sheet1
movie_repo = GoogleSheetsMovieRepository(movies_sheet)
external_api_movie_repo = ExternalAPIMovieRepository(
    settings.MOVIE_API_URL, settings.MOVIE_API_KEY
)


def get_movie_repo():
    return movie_repo


def get_external_api_movie_repo():
    return external_api_movie_repo
