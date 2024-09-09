from movies_sheet_connector import (
    MoviesSheetConnector,
    PageOutOfBoundsError,
)
from movies_page import MoviesPage
from unittest.mock import Mock
from pytest import raises


class TestMoviesSheetConnector:
    def test_connector_to_transform_sheet_data_format_in_intended_way(self):
        sheet = Mock()
        sheet.col_values.return_value = [
            "James Cameron",
            "John Lasseter",
            "Tim Burton",
            "",
        ]
        sheet.get.return_value = [
            ["James Cameron", "Titanic", "1998", "TRUE", "1"],
            ["John Lasseter", "Cars", "2006", "FALSE", "2"],
        ]
        expected_movies = [
            {
                "title": "Titanic",
                "director": "James Cameron",
                "watched": True,
                "year": 1998,
                "id": 1,
            },
            {
                "title": "Cars",
                "director": "John Lasseter",
                "watched": False,
                "year": 2006,
                "id": 2,
            },
        ]
        connector = MoviesSheetConnector(sheet)
        movies = connector.get_movies_by_page(MoviesPage(1, 2))
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
            ["James Cameron", "Titanic", "1998", "TRUE", "1"],
            ["John Lasseter", "Cars", "2006", "FALSE", "2"],
        ]
        connector = MoviesSheetConnector(sheet)
        connector.get_movies_by_page(MoviesPage(2, 2))
        sheet.get.assert_called_with("A4:E5")

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
            ["James Cameron", "Titanic", "1998", "TRUE", "1"],
            ["John Lasseter", "Cars", "2006", "FALSE", "2"],
        ]
        connector = MoviesSheetConnector(sheet)
        connector.get_movies_by_page(MoviesPage(2, 10))
        sheet.get.assert_called_with("A12:E21")

    def test_get_movies_by_page_should_fail_when_is_out_of_bounds_of_the_list(self):
        with raises(PageOutOfBoundsError) as error:
            sheet = Mock()
            sheet.col_values.return_value = [
                "James Cameron",
                "John Lasseter",
                "Tim Burton",
                "",
            ]
            connector = MoviesSheetConnector(sheet)
            connector.get_movies_by_page(MoviesPage(3, 2))
        assert "Selected page is out of bounds" in str(error)

    def test_get_movie_count_with_existing_movies(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", "James Cameron", "John Lasseter"]
        movie_count = MoviesSheetConnector(sheet).get_movie_count()
        assert movie_count == 2

    def test_get_movie_count_with_no_movies(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", ""]
        movie_count = MoviesSheetConnector(sheet).get_movie_count()
        assert movie_count == 0

    def test_get_pagination_metadata_xxx(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", ""]
        movie_count = MoviesSheetConnector(sheet).get_movie_count()
        assert movie_count == 0
