from movies_page import MoviesPage, InvalidPageNumberError, InvalidPageSizeError
from pytest import raises


class TestMoviesPage:
    def test_movies_page_should_fail_when_constructed_with_negative_number(self):
        with raises(InvalidPageNumberError) as error:
            MoviesPage(-1, 2)
        assert "-1 is not a valid page number" in str(error)

    def test_movies_page_should_fail_when_constructed_with_negative_size(self):
        with raises(InvalidPageSizeError) as error:
            MoviesPage(2, -1)
        assert "-1 is not a valid page size" in str(error)
