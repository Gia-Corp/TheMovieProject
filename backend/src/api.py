from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import FastAPI
import src.settings as settings
from .application.controllers import (
    movies_controller,
    auth_controller,
    watch_events_controller,
)
from .application.exceptions import (
    APIException,
    validation_exception_handler,
    http_exception_handler,
    generic_exception_handler,
)

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

api.add_exception_handler(RequestValidationError, validation_exception_handler)
api.add_exception_handler(StarletteHTTPException, http_exception_handler)
api.add_exception_handler(APIException, generic_exception_handler)

api.include_router(auth_controller)
api.include_router(movies_controller)
api.include_router(watch_events_controller)


@api.get("/")
def hello_world():
    return "The Movie Project"
