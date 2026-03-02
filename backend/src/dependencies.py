import gspread
import src.settings as settings
from src.infra.google_sheets_movie_repository import GoogleSheetsMovieRepository

client = gspread.service_account_from_dict(settings.SHEET_CREDENTIALS)
movies_sheet = client.open(settings.SHEET_NAME).sheet1
movie_repo = GoogleSheetsMovieRepository(movies_sheet)


def get_movie_repo():
    return movie_repo
