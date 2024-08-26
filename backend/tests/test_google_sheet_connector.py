from google_sheet_connector import (
    GoogleSheetConnector,
    InvalidPageNumberError,
    InvalidPageSizeError,
    PageOutOfBoundsError,
)
from unittest.mock import Mock
from pytest import raises


class TestGoogleSheetConnector:
    def test_connector_to_transform_sheet_data_format_in_intended_way(self):
        sheet = Mock()
        sheet.col_values.return_value = [
            "James Cameron",
            "John Lasseter",
            "Tim Burton",
            "",
        ]
        sheet.get.return_value = [
            ["James Cameron", "Titanic", "1998", "TRUE"],
            ["John Lasseter", "Cars", "2006", "FALSE"],
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
        movies = connector.get_movies_by_page(1, 2)
        assert movies == expected_movies

    def test_connector_to_fetch_correct_sheet_range_based_on_page_size_and_number(self):
        sheet = Mock()
        sheet.col_values.return_value = [
            "Martin Scorsese",
            "Tim Burton",
            "James Cameron",
            "John Lasseter",
            "",
        ]
        sheet.get.return_value = [
            ["James Cameron", "Titanic", 1998, "TRUE"],
            ["John Lasseter", "Cars", 2006, "FALSE"],
        ]
        connector = GoogleSheetConnector(sheet)
        connector.get_movies_by_page(2, 2)
        sheet.get.assert_called_with("A4:D5")

    def test_connector_to_fetch_correct_sheet_range_when_different_page_size(self):
        sheet = Mock()
        sheet.col_values.return_value = [
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
            "a",
        ]
        sheet.get.return_value = [
            ["James Cameron", "Titanic", 1998, "TRUE"],
            ["John Lasseter", "Cars", 2006, "FALSE"],
        ]
        connector = GoogleSheetConnector(sheet)
        connector.get_movies_by_page(2, 10)
        sheet.get.assert_called_with("A12:D21")

    def test_connector_to_fetch_first_default_page_size_when_not_determined(self):
        sheet = Mock()
        sheet.col_values.return_value = ["James Cameron", "John Lasseter"]
        sheet.get.return_value = [
            ["James Cameron", "Titanic", 1998, "TRUE"],
            ["John Lasseter", "Cars", 2006, "FALSE"],
        ]
        connector = GoogleSheetConnector(sheet)
        connector.get_movies_by_page(None, None)
        sheet.get.assert_called_with("A2:D11")

    def test_get_movies_by_page_should_fail_when_page_number_is_invalid(self):
        with raises(InvalidPageNumberError) as error:
            sheet = Mock()
            connector = GoogleSheetConnector(sheet)
            connector.get_movies_by_page(-1, 5)
        assert "-1 is not a valid page number" in str(error)

    def test_get_movies_by_page_should_fail_when_page_size_is_invalid(self):
        with raises(InvalidPageSizeError) as error:
            sheet = Mock()
            connector = GoogleSheetConnector(sheet)
            connector.get_movies_by_page(7, -1)
        assert "-1 is not a valid page size" in str(error)

    def test_get_movies_by_page_should_fail_when_is_out_of_bounds_of_the_list(self):
        with raises(PageOutOfBoundsError) as error:
            sheet = Mock()
            sheet.col_values.return_value = [
                "James Cameron",
                "John Lasseter",
                "Tim Burton",
                "",
            ]
            connector = GoogleSheetConnector(sheet)
            connector.get_movies_by_page(3, 2)
        assert "Selected page is out of bounds" in str(error)

    def test_get_movie_count_with_existing_movies(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", "James Cameron", "John Lasseter"]
        movie_count = GoogleSheetConnector(sheet).get_movie_count()
        assert movie_count == 2

    def test_get_movie_count_with_no_movies(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", ""]
        movie_count = GoogleSheetConnector(sheet).get_movie_count()
        assert movie_count == 0

    def test_get_pagination_metadata_xxx(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", ""]
        movie_count = GoogleSheetConnector(sheet).get_movie_count()
        assert movie_count == 0
