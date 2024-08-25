from google_sheet_connector import GoogleSheetConnector
from unittest.mock import Mock


class TestGoogleSheetConnector:
    def test_when_exists_many_movies_as_get_movie_limit(self):
        sheet = Mock()
        sheet.get_all_records.return_value = [
            {
                "Película": "Titanic",
                "Director": "James Cameron",
                "Vista": "TRUE",
                "Año": 1998,
            },
            {
                "Película": "Cars",
                "Director": "John Lasseter",
                "Vista": "FALSE",
                "Año": 2006,
            },
        ]
        expected_movies = [
            {
                "title": "Titanic",
                "director": "James Cameron",
                "watched": True,
                "year": 1998,
            },
            {
                "title": "Cars",
                "director": "John Lasseter",
                "watched": False,
                "year": 2006,
            },
        ]
        connector = GoogleSheetConnector(sheet)
        movies = connector.get_movies(2)
        assert movies == expected_movies
