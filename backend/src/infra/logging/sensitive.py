from typing import Any

SENSITIVE_BODY_FIELDS = frozenset(
    {
        "password",
        "hashed_password",
        "token",
        "access_token",
        "refresh_token",
        "card_number",
        "cvv",
        "cvc",
        "ssn",
        "api_key",
        "apikey",
        "secret",
    }
)

SENSITIVE_HEADERS = frozenset(
    {
        "authorization",
        "cookie",
        "set-cookie",
        "x-api-key",
    }
)


def redact_body(body: Any) -> Any:
    """Devuelve una copia del body con los campos sensibles redactados."""
    if not isinstance(body, dict):
        return body

    redacted = {}
    for key, value in body.items():
        if key.lower() in SENSITIVE_BODY_FIELDS:
            redacted[key] = "[REDACTED]"
        elif isinstance(value, dict):
            redacted[key] = redact_body(value)
        elif isinstance(value, list):
            redacted[key] = [
                redact_body(item) if isinstance(item, dict) else item for item in value
            ]
        else:
            redacted[key] = value
    return redacted


def redact_headers(headers: dict[str, str]) -> dict[str, str]:
    """Devuelve los headers con los valores sensibles redactados."""
    redacted = {}
    for key, value in headers.items():
        if key.lower() in SENSITIVE_HEADERS:
            redacted[key] = _redact_header_value(key.lower(), value)
        else:
            redacted[key] = value
    return redacted


def _redact_header_value(name: str, value: str) -> str:
    if name == "authorization":
        scheme = value.split(" ", 1)[0]
        return scheme if scheme else "[REDACTED]"
    return "[REDACTED]"
