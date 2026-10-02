"""Tagged logging setup shared across the backend, mirroring the agentic core's style."""
from __future__ import annotations

import logging
import sys

from app.core.config import settings

_CONFIGURED = False


def configure_logging() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s %(message)s", datefmt="%H:%M:%S"))

    root = logging.getLogger("valtier_backend")
    root.setLevel(settings.log_level.upper())
    root.addHandler(handler)
    root.propagate = False

    _CONFIGURED = True


def get_logger(tag: str):
    configure_logging()
    logger = logging.getLogger(f"valtier_backend.{tag.lower().replace(' ', '_')}")

    class _TagAdapter(logging.LoggerAdapter):
        def process(self, msg, kwargs):
            return f"[{tag}] {msg}", kwargs

    return _TagAdapter(logger, {})
