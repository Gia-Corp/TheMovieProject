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

    def test_get_first_index_when_it_is_the_first_page(self):
        page = MoviesPage(1, 10)
        assert page.get_first_index() == 1

    def test_get_first_index_when_it_is_not_the_first_page(self):
        page = MoviesPage(3, 10)
        assert page.get_first_index() == 21

    def test_get_last_index_when_it_is_the_first_page(self):
        page = MoviesPage(1, 10)
        assert page.get_last_index() == 10

    def test_get_last_index_when_it_is_not_the_first_page(self):
        page = MoviesPage(2, 7)
        assert page.get_last_index() == 14

    def test_movies_page_sets_default_number_and_size_when_not_given(self):
        page = MoviesPage()
        assert page.number == 1 and page.size == 10
