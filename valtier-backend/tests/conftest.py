"""
Shared pytest fixtures.

Uses a dedicated `valtier_test` PostgreSQL database (see README for
setup). Tables are created directly from SQLAlchemy metadata for
speed; Alembic migrations are exercised separately via
`alembic upgrade head` against the dev/staging database.
"""
from __future__ import annotations

import os
import uuid

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://valtier:valtier@localhost:5432/valtier_test")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_dummy")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_dummy")
os.environ.setdefault("GOOGLE_API_KEY", "dummy-test-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401  (register all models on Base.metadata)
from app.core.config import get_settings
from app.core.database import Base, get_db
from app.main import app as fastapi_app

settings = get_settings()
_engine = create_engine(settings.database_url, future=True)
_TestingSessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False, future=True)


@pytest.fixture(scope="session", autouse=True)
def _create_schema():
    Base.metadata.create_all(_engine)
    yield
    Base.metadata.drop_all(_engine)


@pytest.fixture()
def db_session():
    session = _TestingSessionLocal()
    try:
        yield session
    finally:
        # Clean tables between tests, cheapest approach for a small schema.
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.commit()
        session.close()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


def _unique_email() -> str:
    return f"user_{uuid.uuid4().hex[:10]}@example.com"


@pytest.fixture()
def signup_user():
    """Factory fixture: returns a callable that signs up a user and returns (email, tokens)."""

    def _signup(client: TestClient, password: str = "Password123", full_name: str = "Test User"):
        email = _unique_email()
        resp = client.post(
            "/api/v1/auth/signup",
            json={"email": email, "password": password, "full_name": full_name},
        )
        assert resp.status_code == 201, resp.text
        return email, resp.json()

    return _signup


@pytest.fixture()
def auth_headers(client, signup_user):
    _, tokens = signup_user(client)
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.fixture()
def admin_headers(client, signup_user, db_session):
    from app.models.user import User, UserRole

    email, tokens = signup_user(client)
    user = db_session.query(User).filter(User.email == email).first()
    user.role = UserRole.ADMIN
    db_session.commit()

    # Re-login so the JWT's `role` claim reflects the promotion.
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123"})
    access_token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}
