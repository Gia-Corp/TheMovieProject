from movies_page import MoviesPage, InvalidPageNumberError
from pytest import raises


class TestMoviesPage:
    def test_movies_page_should_fail_when_constructed_with_negative_number(self):
        with raises(InvalidPageNumberError) as error:
            MoviesPage(-1, 2)
        assert "-1 is not a valid page number" in str(error)
