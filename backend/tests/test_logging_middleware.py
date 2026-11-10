import io
import json
import logging
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from src.api import api
from src.dependencies import get_movie_repo
from src.infra.logging import (
    AsyncLogHandler,
    JsonFormatter,
    redact_body,
    redact_headers,
)
from src.infra.logging.context import set_request_id


@pytest.fixture(autouse=True)
def reset_request_id() -> None:
    set_request_id("-")
    yield
    set_request_id("-")


@pytest.fixture
def api_log_stream() -> Iterator[io.StringIO]:
    logger = logging.getLogger("api")
    logger.setLevel(logging.INFO)
    stream = io.StringIO()
    handler = logging.StreamHandler(stream)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    yield stream
    logger.removeHandler(handler)


def _parse_logged_entries(stream: io.StringIO) -> list[dict]:
    lines = [line for line in stream.getvalue().splitlines() if line.strip()]
    return [json.loads(line) for line in lines]


class TestLoggingMiddleware:
    def test_request_and_response_are_logged_as_json(
        self, client: TestClient, api_log_stream: Iterator[io.StringIO]
    ) -> None:
        response = client.get("/")

        assert response.status_code == 200
        entries = _parse_logged_entries(api_log_stream)

        assert len(entries) == 2
        request_log, response_log = entries

        assert request_log["message"] == "request"
        assert request_log["level"] == "INFO"
        assert request_log["method"] == "GET"
        assert request_log["path"] == "/"
        assert "request_id" in request_log
        assert request_log["request_id"] != "-"

        assert response_log["message"] == "response"
        assert response_log["level"] == "INFO"
        assert response_log["status_code"] == 200
        assert "latency_ms" in response_log
        assert response_log["request_id"] == request_log["request_id"]

    def test_response_log_includes_status_code_and_latency(
        self, client: TestClient, api_log_stream: Iterator[io.StringIO]
    ) -> None:
        response = client.get("/")

        assert response.status_code == 200
        response_log = _parse_logged_entries(api_log_stream)[1]
        assert response_log["status_code"] == 200
        assert isinstance(response_log["latency_ms"], float)
        assert "response_size" in response_log

    def test_response_includes_x_request_id_header(self, client: TestClient) -> None:
        response = client.get("/")

        assert response.status_code == 200
        assert response.headers["X-Request-ID"]

    def test_async_handler_binds_request_context(self, client: TestClient) -> None:
        stream = io.StringIO()
        target_handler = logging.StreamHandler(stream)
        target_handler.setFormatter(JsonFormatter())
        async_handler = AsyncLogHandler(target_handler)
        root_logger = logging.getLogger()
        root_logger.addHandler(async_handler)
        try:
            response = client.get("/")

            assert response.status_code == 200
            entries = [
                json.loads(line)
                for line in stream.getvalue().splitlines()
                if line.strip()
            ]
            request_entries = [e for e in entries if e.get("message") == "request"]
            assert len(request_entries) == 1
            assert request_entries[0]["request_id"] != "-"
        finally:
            root_logger.removeHandler(async_handler)
            async_handler.close()

    def test_health_check_is_not_logged(
        self, client: TestClient, api_log_stream: Iterator[io.StringIO]
    ) -> None:
        response = client.get("/health")

        assert response.status_code == 404
        assert _parse_logged_entries(api_log_stream) == []

    def test_sensitive_data_is_redacted_in_request_logs(
        self,
        client: TestClient,
        auth_headers,
        fake_repos,
        api_log_stream: Iterator[io.StringIO],
    ) -> None:
        fake_repos.make_user(user_id=1)
        response = client.post(
            "/api/movies",
            json={
                "title": "Argo",
                "year": 2012,
                "watched_by": [1],
                "password": "super-secret",
                "token": "jwt-super-secret",
            },
            headers=auth_headers(1),
        )

        assert response.status_code == 404
        entries = _parse_logged_entries(api_log_stream)
        request_log = entries[0]

        body = request_log.get("body")
        assert body is not None
        assert body["password"] == "[REDACTED]"
        assert body["token"] == "[REDACTED]"
        assert "super-secret" not in json.dumps(entries)
        assert "jwt-super-secret" not in json.dumps(entries)
        assert request_log["headers"]["authorization"] == "Bearer"

    def test_json_formatter_skips_task_name(self) -> None:
        record = logging.LogRecord(
            name="api",
            level=logging.INFO,
            pathname="src/api.py",
            lineno=1,
            msg="request",
            args=None,
            exc_info=None,
            funcName="dispatch",
            sinfo=None,
        )
        record.taskName = "Task-3"
        entry = json.loads(JsonFormatter().format(record))

        assert entry["message"] == "request"
        assert "taskName" not in entry

    def test_unhandled_exception_is_logged_with_stack_trace(
        self, client: TestClient, api_log_stream: Iterator[io.StringIO]
    ) -> None:
        def raise_unexpected_error() -> None:
            raise RuntimeError("boom")

        api.dependency_overrides[get_movie_repo] = raise_unexpected_error

        with TestClient(
            api, base_url="https://testserver", raise_server_exceptions=False
        ) as error_client:
            response = error_client.get("/api/movies?page=1&size=10")

        assert response.status_code == 500
        assert response.headers["X-Request-ID"]

        entries = _parse_logged_entries(api_log_stream)
        error_logs = [entry for entry in entries if entry.get("level") == "ERROR"]
        assert len(error_logs) == 1
        error_log = error_logs[0]
        assert error_log["message"] == "unhandled_exception"
        assert error_log["status_code"] == 500
        assert "boom" in error_log["exception"]
        assert error_log["request_id"]

        request_logs = [entry for entry in entries if entry.get("message") == "request"]
        assert len(request_logs) == 1
        assert error_log["request_id"] == request_logs[0]["request_id"]


class TestSensitiveDataRedaction:
    def test_redact_body_replaces_sensitive_fields(self) -> None:
        body = redact_body(
            {
                "title": "Argo",
                "password": "super-secret",
                "user": {"token": "jwt-super-secret"},
                "watched_by": [1, 2],
            }
        )

        assert body["title"] == "Argo"
        assert body["password"] == "[REDACTED]"
        assert body["user"]["token"] == "[REDACTED]"
        assert body["watched_by"] == [1, 2]

    def test_redact_body_returns_non_dict_untouched(self) -> None:
        assert redact_body("raw-body") == "raw-body"

    def test_redact_headers_redacts_authorization_token(self) -> None:
        redacted = redact_headers(
            {
                "authorization": "Bearer super-secret",
                "content-type": "application/json",
            }
        )

        assert redacted["authorization"] == "Bearer"
        assert redacted["content-type"] == "application/json"
