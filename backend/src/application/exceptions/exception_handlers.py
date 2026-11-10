import logging
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime
from .api_exception import APIException
from src.infra.logging.context import get_request_id

logger = logging.getLogger("api.errors")


def _error_response(message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "message": message,
            "timestamp": str(datetime.now()),
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        "unhandled_exception",
        exc_info=exc,
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": 500,
        },
    )

    response = _error_response(message="Internal server error", status_code=500)
    response.headers["X-Request-ID"] = get_request_id()
    return response


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []

    for error in errors:
        loc = error.get("loc", [])
        # Tomar solo las partes que son nombres de campo (strings), ignorando "body"/"query" e índices int
        field_parts = [
            str(p)
            for p in loc
            if isinstance(p, str) and p not in ("body", "query", "path")
        ]
        field = ".".join(field_parts).capitalize() if field_parts else "Body"
        msg = error.get("msg", "Validation error")
        messages.append(f"{field}: {msg}")

    return _error_response(
        message="; ".join(messages),
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return _error_response(
        message=exc.detail,
        status_code=exc.status_code,
    )


async def generic_exception_handler(request: Request, exc: APIException):
    return _error_response(
        message=exc.message,
        status_code=exc.status_code,
    )
