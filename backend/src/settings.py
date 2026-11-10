from dotenv import load_dotenv
from os import getenv

load_dotenv()


def _int_env(name: str, default: int) -> int:
    raw_value = getenv(name)
    if raw_value is None or raw_value == "":
        return default
    try:
        return int(raw_value)
    except ValueError as error:
        raise RuntimeError(f"{name} must be an integer, got {raw_value!r}") from error


# General
PORT = getenv("PORT")
FRONTEND_URL = getenv("FRONTEND_URL")

# Google Sheets
SHEET_NAME = getenv("SHEET_NAME")
SHEET_CREDENTIALS = {
    "type": getenv("TYPE"),
    "project_id": getenv("PROJECT_ID"),
    "private_key_id": getenv("PRIVATE_KEY_ID"),
    "private_key": getenv("PRIVATE_KEY"),
    "client_email": getenv("CLIENT_EMAIL"),
    "client_id": getenv("CLIENT_ID"),
    "auth_uri": getenv("AUTH_URI"),
    "token_uri": getenv("TOKEN_URI"),
    "auth_provider_x509_cert_url": getenv("AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": getenv("CLIENT_X509_CERT_URL"),
    "universe_domain": getenv("UNIVERSE_DOMAIN"),
}

# The Movie DB
MOVIE_API_URL = getenv("MOVIE_API_URL")
MOVIE_API_KEY = getenv("MOVIE_API_KEY")

# JWT authentication
JWT_SECRET_KEY = getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = getenv("JWT_ALGORITHM") or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = _int_env("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
REFRESH_TOKEN_EXPIRE_DAYS = _int_env("REFRESH_TOKEN_EXPIRE_DAYS", 7)

# Logging
LOG_LEVEL = getenv("LOG_LEVEL") or "INFO"
LOG_EXCLUDE_PATHS = getenv("LOG_EXCLUDE_PATHS") or "/health"
