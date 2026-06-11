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
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = [
            "James Cameron",
            "John Lasseter",
            "Tim Burton",
            "",
        ]
        movies_sheet.get.return_value = [
            ["James Cameron", "Titanic", "1998", "1"],
            ["John Lasseter", "Cars", "2006", "2"],
        ]
        expected_movies = [
            Movie(id=1, title="Titanic", director="James Cameron", year=1998),
            Movie(id=2, title="Cars", director="John Lasseter", year=2006),
        ]

        watch_events_sheet = Mock()
        watch_events_sheet.findall.return_value = []

        repo = GoogleSheetsMovieRepository(movies_sheet, watch_events_sheet)
        movies = repo.get_movies_by_page(Page(1, 2))
        assert movies == expected_movies

    def test_movie_repo_to_fetch_correct_sheet_range_based_on_page_size_and_number(
        self,
    ):
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = [
            "Martin Scorsese",
            "Tim Burton",
            "James Cameron",
            "John Lasseter",
            "",
        ]
        movies_sheet.get.return_value = [
            ["James Cameron", "Titanic", "1998", "1", "", "", ""],
            ["John Lasseter", "Cars", "2006", "2", "", "", ""],
        ]

        watch_events_sheet = Mock()
        watch_events_sheet.findall.return_value = []

        repo = GoogleSheetsMovieRepository(movies_sheet, watch_events_sheet)
        repo.get_movies_by_page(Page(2, 2))
        movies_sheet.get.assert_called_with("A4:G5")

    def test_movie_repo_to_fetch_correct_sheet_range_when_different_page_size(self):
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = [
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
        movies_sheet.get.return_value = [
            [
                "James Cameron",
                "Titanic",
                "1998",
                "1",
                "120 min",
                "A love story on a boat.",
                "",
            ],
            [
                "John Lasseter",
                "Cars",
                "2006",
                "2",
                "90 min",
                "Cars racing each other.",
                "",
            ],
        ]

        watch_events_sheet = Mock()
        watch_events_sheet.findall.return_value = []

        repo = GoogleSheetsMovieRepository(movies_sheet, watch_events_sheet)
        repo.get_movies_by_page(Page(2, 10))
        movies_sheet.get.assert_called_with("A12:G21")

    def test_get_movies_by_page_should_fail_when_is_out_of_bounds_of_the_list(self):
        with raises(PageOutOfBoundsError) as error:
            movies_sheet = Mock()
            movies_sheet.col_values.return_value = [
                "James Cameron",
                "John Lasseter",
                "Tim Burton",
                "",
            ]

            watch_events_sheet = Mock()
            watch_events_sheet.findall.return_value = []

            repo = GoogleSheetsMovieRepository(movies_sheet, watch_events_sheet)
            repo.get_movies_by_page(Page(3, 2))
        assert "Selected page is out of bounds" in str(error)

    def test_get_movie_count_with_existing_movies(self):
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = [
            "Director",
            "James Cameron",
            "John Lasseter",
        ]
        movie_count = GoogleSheetsMovieRepository(
            movies_sheet, Mock()
        ).get_movie_count()
        assert movie_count == 2

    def test_get_movie_count_with_no_movies(self):
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = ["Director", ""]
        movie_count = GoogleSheetsMovieRepository(
            movies_sheet, Mock()
        ).get_movie_count()
        assert movie_count == 0
