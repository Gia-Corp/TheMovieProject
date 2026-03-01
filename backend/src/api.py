from .application.pagination.movies_page import InvalidPageNumberError, InvalidPageSizeError
from .application.controllers.movies_controller import movies
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request
from .domain.movie import (
    EmptyMovieDirectorError,
    EmptyMovieTitleError,
    NegativeMovieYearError,
)
import src.settings as settings

api = FastAPI(
    title="The Movie Project API",
    swagger_ui_parameters={
        "syntaxHighlight": {"theme": "arta"},
        "tryItOutEnabled": True,
    },
)

origins = [
    settings.FRONTEND_URL,
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.exception_handler(NegativeMovieYearError)
@api.exception_handler(EmptyMovieTitleError)
@api.exception_handler(EmptyMovieDirectorError)
@api.exception_handler(InvalidPageNumberError)
@api.exception_handler(InvalidPageSizeError)
async def api_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())


api.include_router(movies)


@api.get("/")
def hello_world():
    return "The Movie Project"
