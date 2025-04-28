from .controllers.movies_controller import movies
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .domain.movie import (
    EmptyMovieDirectorError,
    EmptyMovieTitleError,
    NegativeMovieYearError,
)
from .pagination.movies_page import InvalidPageNumberError, InvalidPageSizeError

app = FastAPI(
    title="The Movie Project API",
    swagger_ui_parameters={
        "syntaxHighlight": {"theme": "arta"},
        "tryItOutEnabled": True,
    },
)


@app.exception_handler(NegativeMovieYearError)
@app.exception_handler(EmptyMovieTitleError)
@app.exception_handler(EmptyMovieDirectorError)
@app.exception_handler(InvalidPageNumberError)
@app.exception_handler(InvalidPageSizeError)
async def api_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())


app.include_router(movies)


@app.get("/")
def hello_world():
    return "The Movie Project"
