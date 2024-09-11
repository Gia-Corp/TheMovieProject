from domain.movie import (
    Movie,
    NegativeMovieYearError,
    EmptyMovieTitleError,
    EmptyMovieDirectorError,
)
from pytest import raises


class TestMovie:
    def test_movie_year_cannot_be_negative(self):
        with raises(NegativeMovieYearError) as error:
            Movie("Argo", "Ben Affleck", -1, True)
        assert "Movie year cannot be negative: -1" in str(error)

    def test_movie_title_cannot_be_empty(self):
        with raises(EmptyMovieTitleError) as error:
            Movie("", "Ben Affleck", 2012, True)
        assert "Movie title cannot be empty" in str(error)

    def test_movie_director_cannot_be_empty(self):
        with raises(EmptyMovieDirectorError) as error:
            Movie("Argo", "", 2012, True)
        assert "Movie director cannot be empty" in str(error)
