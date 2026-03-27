from src.domain import Movie
from src.infra import (
    GoogleSheetsMovieRepository,
    PageOutOfBoundsError,
)
from src.application.pagination import Page
from unittest.mock import Mock
from pytest import raises


class TestGoogleSheetsMovieRepository:
    def test_movie_repo_to_transform_sheet_data_format_in_intended_way(self):
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
            Movie(
                id=1, title="Titanic", director="James Cameron", year=1998, watched=True
            ),
            Movie(
                id=2, title="Cars", director="John Lasseter", year=2006, watched=False
            ),
        ]
        repo = GoogleSheetsMovieRepository(sheet)
        movies = repo.get_movies_by_page(Page(1, 2))
        assert movies == expected_movies

    def test_movie_repo_to_fetch_correct_sheet_range_based_on_page_size_and_number(
        self,
    ):
        sheet = Mock()
        sheet.col_values.return_value = [
            "Martin Scorsese",
            "Tim Burton",
            "James Cameron",
            "John Lasseter",
            "",
        ]
        sheet.get.return_value = [
            ["James Cameron", "Titanic", "1998", "TRUE", "1", "", "", ""],
            ["John Lasseter", "Cars", "2006", "FALSE", "2", "", "", ""],
        ]
        repo = GoogleSheetsMovieRepository(sheet)
        repo.get_movies_by_page(Page(2, 2))
        sheet.get.assert_called_with("A4:H5")

    def test_movie_repo_to_fetch_correct_sheet_range_when_different_page_size(self):
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
            [
                "James Cameron",
                "Titanic",
                "1998",
                "TRUE",
                "1",
                "120 min",
                "A love story on a boat.",
                "",
            ],
            [
                "John Lasseter",
                "Cars",
                "2006",
                "FALSE",
                "2",
                "90 min",
                "Cars racing each other.",
                "",
            ],
        ]
        repo = GoogleSheetsMovieRepository(sheet)
        repo.get_movies_by_page(Page(2, 10))
        sheet.get.assert_called_with("A12:H21")

    def test_get_movies_by_page_should_fail_when_is_out_of_bounds_of_the_list(self):
        with raises(PageOutOfBoundsError) as error:
            sheet = Mock()
            sheet.col_values.return_value = [
                "James Cameron",
                "John Lasseter",
                "Tim Burton",
                "",
            ]
            repo = GoogleSheetsMovieRepository(sheet)
            repo.get_movies_by_page(Page(3, 2))
        assert "Selected page is out of bounds" in str(error)

    def test_get_movie_count_with_existing_movies(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", "James Cameron", "John Lasseter"]
        movie_count = GoogleSheetsMovieRepository(sheet).get_movie_count()
        assert movie_count == 2

    def test_get_movie_count_with_no_movies(self):
        sheet = Mock()
        sheet.col_values.return_value = ["Director", ""]
        movie_count = GoogleSheetsMovieRepository(sheet).get_movie_count()
        assert movie_count == 0
