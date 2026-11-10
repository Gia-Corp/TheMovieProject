import logging
import sys

import src.settings as settings

from .async_handler import AsyncLogHandler
from .json_formatter import JsonFormatter

DEFAULT_EXCLUDE_PATHS = frozenset({"/health"})


_exclude_paths: frozenset[str] = DEFAULT_EXCLUDE_PATHS


def _parse_exclude_paths(raw_value: str | None) -> frozenset[str]:
    if not raw_value:
        return DEFAULT_EXCLUDE_PATHS
    return frozenset(path.strip() for path in raw_value.split(",") if path.strip())


def configure_logging() -> None:
    global _exclude_paths

    log_level = settings.LOG_LEVEL or "INFO"
    _exclude_paths = frozenset(_parse_exclude_paths(settings.LOG_EXCLUDE_PATHS))

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))

    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)
        handler.close()

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(AsyncLogHandler(stdout_handler))

    # Silenciar los logs automaticos de uvicorn (access logs y startup) para
    # que el flujo de logs quede centralizado en el JsonFormatter del proyecto.
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_exclude_paths() -> frozenset[str]:
    return _exclude_paths
