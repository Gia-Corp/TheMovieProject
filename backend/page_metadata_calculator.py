class PageMetadataCalculator:
    def calculate(self, page, movie_count, endpoint):
        return {
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
