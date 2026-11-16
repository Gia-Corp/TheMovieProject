from src.domain import Movie
from src.infra import (
    GoogleSheetsMovieRepository,
    MovieNotFoundError,
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

        repo = GoogleSheetsMovieRepository(movies_sheet)
        movies = repo.get_all_by_page(Page(1, 2))
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

        repo = GoogleSheetsMovieRepository(movies_sheet)
        repo.get_all_by_page(Page(2, 2))
        movies_sheet.get.assert_called_with("A4:H5")

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

        repo = GoogleSheetsMovieRepository(movies_sheet)
        repo.get_all_by_page(Page(2, 10))
        movies_sheet.get.assert_called_with("A12:H21")

    def test_get_all_by_page_should_fail_when_is_out_of_bounds_of_the_list(self):
        with raises(PageOutOfBoundsError) as error:
            movies_sheet = Mock()
            movies_sheet.col_values.return_value = [
                "James Cameron",
                "John Lasseter",
                "Tim Burton",
                "",
            ]

            repo = GoogleSheetsMovieRepository(movies_sheet)
            repo.get_all_by_page(Page(3, 2))
        assert "Selected page is out of bounds" in str(error)

    def test_total_movies_with_existing_movies(self):
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = [
            "Director",
            "James Cameron",
            "John Lasseter",
        ]
        movie_count = GoogleSheetsMovieRepository(movies_sheet).total_movies()
        assert movie_count == 2

    def test_total_movies_with_no_movies(self):
        movies_sheet = Mock()
        movies_sheet.col_values.return_value = ["Director"]
        movie_count = GoogleSheetsMovieRepository(movies_sheet).total_movies()
        assert movie_count == 0

    def _movies_sheet_with(self, records):
        movies_sheet = Mock()
        movies_sheet.get_all_records.return_value = records
        return movies_sheet

    def _record(self, id, title, director, year, genre):
        return {
            "director": director,
            "title": title,
            "year": year,
            "id": id,
            "runtime": "",
            "plot": "",
            "poster_url": "",
            "genre": genre,
        }

    def test_get_all_by_criteria_filters_by_title(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
                self._record(2, "Heat", "Michael Mann", 1995, "Crime, Drama"),
            ]
        )

        movies = GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
            title="argo"
        )

        assert [movie.title for movie in movies] == ["Argo"]

    def test_get_all_by_criteria_filters_by_director(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
                self._record(2, "Heat", "Michael Mann", 1995, "Crime, Drama"),
            ]
        )

        movies = GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
            director="affleck"
        )

        assert [movie.title for movie in movies] == ["Argo"]

    def test_get_all_by_criteria_filters_by_year(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
                self._record(2, "Heat", "Michael Mann", 1995, "Crime, Drama"),
            ]
        )

        movies = GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
            year=1995
        )

        assert [movie.title for movie in movies] == ["Heat"]

    def test_get_all_by_criteria_filters_by_genre(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
                self._record(2, "Cars", "John Lasseter", 2006, "Animation"),
            ]
        )

        movies = GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
            genre="thriller"
        )

        assert [movie.title for movie in movies] == ["Argo"]

    def test_get_all_by_criteria_combines_filters(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
                self._record(2, "The Town", "Ben Affleck", 2010, "Crime, Drama"),
                self._record(3, "Heat", "Michael Mann", 1995, "Crime, Drama"),
            ]
        )

        movies = GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
            director="affleck", genre="drama"
        )

        assert [movie.title for movie in movies] == ["Argo", "The Town"]

    def test_get_all_by_criteria_fails_when_nothing_matches(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
            ]
        )

        with raises(MovieNotFoundError):
            GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
                director="nolan"
            )

    def test_get_all_by_criteria_reads_the_sheet_once(self):
        movies_sheet = self._movies_sheet_with(
            [
                self._record(1, "Argo", "Ben Affleck", 2012, "Drama, Thriller"),
            ]
        )

        GoogleSheetsMovieRepository(movies_sheet).get_all_by_criteria(
            title="argo", director="affleck", year=2012, genre="drama"
        )

        movies_sheet.get_all_records.assert_called_once()
