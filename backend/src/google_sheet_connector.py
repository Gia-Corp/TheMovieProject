import config
import gspread

class GoogleSheetConnector:
  def __init__(self):
    gc = gspread.service_account_from_dict(config.SHEET_CREDENTIALS)
    self.sheet = gc.open(config.SHEET_NAME).sheet1

  def get_movies(self, limit):
    raw_movies = self.sheet.get_all_records(expected_headers=['Película','Director','Vista'])[0:limit+1]
    movies = list(map(self.transform_into_movie, raw_movies))
    return movies

  def transform_into_movie(self, raw_movie):
    watched = True if raw_movie['Vista'] == 'TRUE' else False
    return {"title": raw_movie['Película'], "director": raw_movie['Director'], "watched":watched}