from domain.movie import Movie, NegativeMovieYearError
from pytest import raises


class TestMovie:
    def test_movie_year_cannot_be_negative(self):
        with raises(NegativeMovieYearError) as error:
            Movie("Argo", "Ben Affleck", -1, True)
        assert "Movie year cannot be negative: -1" in str(error)
