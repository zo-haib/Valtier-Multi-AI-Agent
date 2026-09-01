"""
Import every model here so Base.metadata is fully populated for Alembic
autogenerate and for `Base.metadata.create_all()` in tests.
"""
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.memory import MemoryEntry  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.subscription import Subscription  # noqa: F401
from app.models.usage import UsageRecord  # noqa: F401
from app.models.user import User  # noqa: F401
