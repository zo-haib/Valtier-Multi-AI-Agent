import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.logging import get_logger

logger = get_logger("REQUEST")

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        logger.info(f"Request started: {request.method} {request.url.path} (ID: {request_id})")
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        logger.info(f"Request completed: {request.method} {request.url.path} (ID: {request_id}) - Status: {response.status_code}")
        
        return response
