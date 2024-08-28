import math


class PageMetadataCalculator:
    def calculate(self, page, movie_count, endpoint):
        url_prefix = endpoint + "?"
        page_size_param = f"&size={page.size}"
        page_count = math.ceil(movie_count / page.size)

        return {
            "page": page.number,
            "size": page.size,
            "page_count": page_count,
            "movie_count": movie_count,
            "links": {
                "first": url_prefix + "page=1" + page_size_param,
                "previous": url_prefix + f"page={page.number - 1}" + page_size_param
                if page.number > 1
                else None,
                "next": url_prefix + f"page={page.number + 1}" + page_size_param
                if page.number < page_count
                else None,
                "last": url_prefix + f"page={page_count}" + page_size_param,
            },
        }
