from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request
from .application.pagination import (
    InvalidPageNumberError,
    InvalidPageSizeError,
)
from .domain import (
    EmptyMovieDirectorError,
    EmptyMovieTitleError,
    NegativeMovieYearError,
)
from .infra import MovieNotFoundError, PageOutOfBoundsError
import src.settings as settings
from .application.controllers import movies_controller

api = FastAPI(
    title="The Movie Project API",
    swagger_ui_parameters={
        "syntaxHighlight": {"theme": "arta"},
        "tryItOutEnabled": True,
    },
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api.exception_handler(PageOutOfBoundsError)
@api.exception_handler(MovieNotFoundError)
@api.exception_handler(NegativeMovieYearError)
@api.exception_handler(EmptyMovieTitleError)
@api.exception_handler(EmptyMovieDirectorError)
@api.exception_handler(InvalidPageNumberError)
@api.exception_handler(InvalidPageSizeError)
async def api_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())


api.include_router(movies_controller)


@api.get("/")
def hello_world():
    return "The Movie Project"
