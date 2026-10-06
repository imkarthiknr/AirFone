"""Consistent error responses: {"detail": "...", "fields": {"field": "message"}}."""

from fastapi import Request
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, status_code: int, detail: str, fields: dict[str, str] | None = None):
        self.status_code = status_code
        self.detail = detail
        self.fields = fields or {}


async def api_error_handler(_request: Request, exc: ApiError) -> JSONResponse:
    body: dict = {"detail": exc.detail}
    if exc.fields:
        body["fields"] = exc.fields
    return JSONResponse(body, status_code=exc.status_code)
