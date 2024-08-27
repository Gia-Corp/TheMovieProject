import math


class PageMetadataCalculator:
    def calculate(self, page, movie_count, endpoint):
        page_count = math.ceil(movie_count / page.size)
        return {
            "page": page.number,
            "size": page.size,
            "page_count": page_count,
            "movie_count": movie_count,
            "links": {
                "first": f"/movies?page=1&size={page.size}",
                "previous": f"/movies?page={(page.number - 1)}&size={page.size}"
                if page.number > 1
                else None,
                "next": f"/movies?page={(page.number + 1)}&size={page.size}",
                "last": f"/movies?page={page_count}&size={page.size}",
            },
        }
