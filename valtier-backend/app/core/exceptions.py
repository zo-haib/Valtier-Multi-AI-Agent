"""
Centralized application exceptions and their FastAPI exception handlers,
so routes raise semantic errors instead of embedding response-building
logic, and production responses never leak stack traces.
"""
from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.utils.logging import get_logger

logger = get_logger("ERROR HANDLER")


class AppError(Exception):
    """Base class for application errors with an HTTP status code."""

    status_code: int = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED


class SubscriptionRequiredError(AppError):
    status_code = status.HTTP_403_FORBIDDEN


class UsageLimitExceededError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation error", "errors": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
        detail = str(exc) if not settings.is_production else "Internal server error"
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": detail})
