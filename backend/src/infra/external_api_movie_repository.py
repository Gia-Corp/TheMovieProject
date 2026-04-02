import httpx


class ExternalAPIMovieRepository:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key

    async def get_by_title_and_year(self, title, year):
        params = {"t": title, "y": year, "type": "movie"}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}", params={"apikey": self.api_key, **params}
            )
            response.raise_for_status()
            movies = response.json()

            return movies
        return
