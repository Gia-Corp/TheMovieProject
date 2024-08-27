from page_metadata_calculator import PageMetadataCalculator
from movies_page import MoviesPage


class TestPageMetadataCalculator:
    def test_calculated_metadata(self):
        metadata = PageMetadataCalculator().calculate(MoviesPage(1, 2), 500, "/movie")
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
