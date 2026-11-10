import json
import logging
import time
from typing import Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from starlette.types import ASGIApp

from src.infra.logging.config import get_exclude_paths
from src.infra.logging.context import get_request_id, new_request_id, set_request_id
from src.infra.logging.sensitive import redact_body, redact_headers

logger = logging.getLogger("api")

SAFE_BODY_METHODS = ("POST", "PUT", "PATCH")
SAFE_BODY_CONTENT_TYPE = "application/json"


class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        self.exclude_paths = get_exclude_paths()

    def _should_exclude(self, path: str) -> bool:
        return (
            path in self.exclude_paths
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi.json")
        )

    async def _read_body(self, request: Request):
        if request.method not in SAFE_BODY_METHODS:
            return None

        content_type = request.headers.get("content-type", "").split(";", 1)[0].strip()
        if content_type != SAFE_BODY_CONTENT_TYPE:
            return None

        body = await request.body()
        if not body:
            return None

        try:
            parsed_body = json.loads(body)
        except ValueError:
            return None

        return redact_body(parsed_body)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if self._should_exclude(request.url.path):
            return await call_next(request)

        request_id = new_request_id()
        set_request_id(request_id)
        request.state.request_id = request_id

        start_time = time.perf_counter()
        body = await self._read_body(request)

        logger.info(
            "request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "headers": redact_headers(dict(request.headers)),
                "client_ip": request.client.host if request.client else None,
                "body": body,
            },
        )

        response = await call_next(request)
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "response",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "latency_ms": latency_ms,
                "response_size": response.headers.get("content-length"),
            },
        )

        response.headers["X-Request-ID"] = get_request_id()
        return response
