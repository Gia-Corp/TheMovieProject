import asyncio
import io
import json
import logging
from collections.abc import Iterator
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from src.domain import Movie
from src.infra import ExternalAPIMovieRepository
from src.infra.google_sheets_movie_repository import GoogleSheetsMovieRepository
from src.infra.logging import JsonFormatter
from src.infra.logging.context import set_request_id


def _parse_logged_entries(stream: io.StringIO) -> list[dict]:
    lines = [line for line in stream.getvalue().splitlines() if line.strip()]
    return [json.loads(line) for line in lines]


@pytest.fixture(autouse=True)
def reset_request_id() -> None:
    set_request_id("-")
    yield
    set_request_id("-")


@pytest.fixture
def db_log_stream() -> Iterator[io.StringIO]:
    logger = logging.getLogger("api.db")
    logger.setLevel(logging.INFO)
    stream = io.StringIO()
    handler = logging.StreamHandler(stream)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    yield stream
    logger.removeHandler(handler)


@pytest.fixture
def external_log_stream() -> Iterator[io.StringIO]:
    logger = logging.getLogger("api.external")
    logger.setLevel(logging.INFO)
    stream = io.StringIO()
    handler = logging.StreamHandler(stream)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    yield stream
    logger.removeHandler(handler)


class _FakeAsyncClient:
    def __init__(self) -> None:
        self.get = AsyncMock()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


class TestDbOperationLogging:
    def test_add_movie_logs_successful_db_operation(self, db_log_stream) -> None:
        sheet = MagicMock()
        sheet.get.return_value = [["1"]]
        repo = GoogleSheetsMovieRepository(sheet)

        repo.add(Movie(id=1, title="Argo", director="Ben Affleck", year=2012))

        entries = _parse_logged_entries(db_log_stream)
        assert len(entries) == 1
        entry = entries[0]
        assert entry["message"] == "db_operation"
        assert entry["level"] == "INFO"
        assert entry["operation"] == "add"
        assert entry["sheet"] == "movies"
        assert entry["rows"] == 1
        assert isinstance(entry["duration_ms"], float)
        assert entry["request_id"] == "-"

    def test_db_operation_failure_is_logged_with_stack_trace(
        self, db_log_stream
    ) -> None:
        sheet = MagicMock()
        sheet.get.side_effect = RuntimeError("sheets down")
        repo = GoogleSheetsMovieRepository(sheet)

        with pytest.raises(RuntimeError):
            repo.add(Movie(id=1, title="Argo", director="Ben Affleck", year=2012))

        entries = _parse_logged_entries(db_log_stream)
        assert len(entries) == 1
        error_log = entries[0]
        assert error_log["message"] == "db_operation_failed"
        assert error_log["level"] == "ERROR"
        assert error_log["operation"] == "add"
        assert error_log["sheet"] == "movies"
        assert "sheets down" in error_log["exception"]
        assert error_log["request_id"] == "-"

    def test_db_operation_logs_request_id_from_context(self, db_log_stream) -> None:
        set_request_id("request-123")
        sheet = MagicMock()
        sheet.get.return_value = [["1"]]
        repo = GoogleSheetsMovieRepository(sheet)

        repo.add(Movie(id=1, title="Argo", director="Ben Affleck", year=2012))

        entries = _parse_logged_entries(db_log_stream)
        assert len(entries) == 1
        assert entries[0]["request_id"] == "request-123"


class TestExternalApiCallLogging:
    def test_get_by_title_and_year_logs_successful_call(
        self, monkeypatch, external_log_stream
    ) -> None:
        response = MagicMock()
        response.status_code = 200
        response.json.return_value = {"Title": "Argo", "Year": "2012"}
        client = _FakeAsyncClient()
        client.get = AsyncMock(return_value=response)
        monkeypatch.setattr(httpx, "AsyncClient", lambda: client)

        repo = ExternalAPIMovieRepository(
            "https://api.themoviedb.org/3/movie", "secret-api-key"
        )
        result = asyncio.run(repo.get_by_title_and_year("Argo", 2012))

        assert result == {"Title": "Argo", "Year": "2012"}
        entries = _parse_logged_entries(external_log_stream)
        assert len(entries) == 1
        entry = entries[0]
        assert entry["message"] == "external_api_call"
        assert entry["level"] == "INFO"
        assert entry["operation"] == "get_by_title_and_year"
        assert entry["method"] == "GET"
        assert entry["url"] == "https://api.themoviedb.org/3/movie"
        assert entry["status_code"] == 200
        assert isinstance(entry["duration_ms"], float)
        assert entry["request_id"] == "-"
        assert "secret-api-key" not in json.dumps(entries)

    def test_get_by_title_and_year_logs_failure(
        self, monkeypatch, external_log_stream
    ) -> None:
        client = _FakeAsyncClient()
        client.get = AsyncMock(side_effect=httpx.ConnectError("boom"))
        monkeypatch.setattr(httpx, "AsyncClient", lambda: client)

        repo = ExternalAPIMovieRepository(
            "https://api.themoviedb.org/3/movie", "secret-api-key"
        )

        with pytest.raises(httpx.ConnectError):
            asyncio.run(repo.get_by_title_and_year("Argo", 2012))

        entries = _parse_logged_entries(external_log_stream)
        assert len(entries) == 1
        error_log = entries[0]
        assert error_log["message"] == "external_api_call_failed"
        assert error_log["level"] == "ERROR"
        assert error_log["operation"] == "get_by_title_and_year"
        assert error_log["method"] == "GET"
        assert "boom" in error_log["exception"]
        assert error_log["request_id"] == "-"
