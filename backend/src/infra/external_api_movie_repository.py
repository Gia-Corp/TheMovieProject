import logging
import time

import httpx
from .google_sheets_movie_repository import MovieNotFoundError

logger = logging.getLogger("api.external")


class ExternalAPIMovieRepository:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key

    async def get_by_title_and_year(self, title, year):
        params = {"t": title, "y": year, "type": "movie"}

        start_time = time.perf_counter()
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}", params={"apikey": self.api_key, **params}
                )
                status_code = response.status_code
                response.raise_for_status()
                movie = response.json()

            if "Error" in movie:
                raise MovieNotFoundError()

            logger.info(
                "external_api_call",
                extra={
                    "operation": "get_by_title_and_year",
                    "method": "GET",
                    "url": self.api_url,
                    "status_code": status_code,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            return movie
        except Exception:
            logger.exception(
                "external_api_call_failed",
                extra={
                    "operation": "get_by_title_and_year",
                    "method": "GET",
                    "url": self.api_url,
                    "duration_ms": round((time.perf_counter() - start_time) * 1000, 2),
                },
            )
            raise
