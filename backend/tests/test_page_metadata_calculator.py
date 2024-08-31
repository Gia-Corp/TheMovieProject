from page_metadata_calculator import PageMetadataCalculator
from movies_page import MoviesPage


class TestPageMetadataCalculator:
    def test_calculate_metadata_for_first_page(self):
        metadata = PageMetadataCalculator().calculate(MoviesPage(1, 2), 500, "/movies")
        expected_metadata = {
            "page": 1,
            "size": 2,
            "page_count": 250,
            "movie_count": 500,
            "links": {
                "first": "/movies?page=1&size=2",
                "previous": None,
                "next": "/movies?page=2&size=2",
                "last": "/movies?page=250&size=2",
            },
        }
        assert expected_metadata == metadata

    def test_calculate_metadata_for_page_in_the_middle(self):
        metadata = PageMetadataCalculator().calculate(MoviesPage(4, 7), 500, "/movies")
        expected_metadata = {
            "page": 4,
            "size": 7,
            "page_count": 72,
            "movie_count": 500,
            "links": {
                "first": "/movies?page=1&size=7",
                "previous": "/movies?page=3&size=7",
                "next": "/movies?page=5&size=7",
                "last": "/movies?page=72&size=7",
            },
        }
        assert expected_metadata == metadata

    def test_calculate_metadata_for_last_page(self):
        metadata = PageMetadataCalculator().calculate(
            MoviesPage(10, 50), 500, "/movies"
        )
        expected_metadata = {
            "page": 10,
            "size": 50,
            "page_count": 10,
            "movie_count": 500,
            "links": {
                "first": "/movies?page=1&size=50",
                "previous": "/movies?page=9&size=50",
                "next": None,
                "last": "/movies?page=10&size=50",
            },
        }
        assert expected_metadata == metadata
