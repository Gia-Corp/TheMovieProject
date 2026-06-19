from src.domain import (
    Movie,
    NegativeMovieYearError,
    EmptyMovieTitleError,
    EmptyMovieDirectorError,
)
from pytest import raises


class TestMovie:
    def test_movie_year_cannot_be_negative(self):
        with raises(NegativeMovieYearError) as error:
            Movie(1, "Argo", "Ben Affleck", -1)
        assert "Movie year cannot be negative: -1" in str(error)

    def test_movie_title_cannot_be_empty(self):
        with raises(EmptyMovieTitleError) as error:
            Movie(1, "", "Ben Affleck", 2012)
        assert "Movie title cannot be empty" in str(error)

    def test_movie_director_cannot_be_empty(self):
        with raises(EmptyMovieDirectorError) as error:
            Movie(1, "Argo", "", 2012)
        assert "Movie director cannot be empty" in str(error)

    def test_movie_stores_its_attributes(self):
        movie = Movie(1, "Argo", "Ben Affleck", 2012)
        print(movie)
        assert (
            movie.id == 1
            and movie.title == "Argo"
            and movie.director == "Ben Affleck"
            and movie.year == 2012
            and not movie.plot
            and not movie.runtime
            and not movie.poster_url
        )
