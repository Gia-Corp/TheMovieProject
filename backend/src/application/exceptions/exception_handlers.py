from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime
from .api_exception import ApiException


def _error_response(message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "message": message,
            "timestamp": str(datetime.now()),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []

    for error in errors:
        field = error.get("loc", [])[1].capitalize()
        msg = error.get("msg", "Validation error")
        messages.append(f"{field}: {msg}")

    return _error_response(
        message="; ".join(messages),
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return _error_response(
        message=exc.detail,
        status_code=exc.status_code,
    )


async def generic_exception_handler(request: Request, exc: ApiException):
    return _error_response(
        message=exc.message,
        status_code=exc.status_code,
    )
