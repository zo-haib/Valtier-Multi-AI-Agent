"""
Central application settings, loaded from environment variables / .env.
Nothing here is hardcoded — every secret and tunable comes from the
environment, per the project's security requirements.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    app_name: str = Field(default="Valtier")
    environment: str = Field(default="development")  # development | staging | production
    api_v1_prefix: str = Field(default="/api/v1")
    frontend_url: str = Field(default="http://localhost:5173")

    # --- Security / JWT ---
    secret_key: str = Field(default="")
    jwt_secret_key: str = Field(default="")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=14)

    # --- Database ---
    database_url: str = Field(
        default="postgresql+psycopg://valtier:valtier@localhost:5432/valtier"
    )

    # --- LLM / Agentic core ---
    google_api_key: str = Field(default="")
    llm_model: str = Field(default="gemini-1.5-flash")
    embedding_model: str = Field(default="models/text-embedding-004")
    llm_temperature: float = Field(default=0.2)
    vector_store_path: str = Field(default="./data/vector_store")

    # --- Stripe ---
    stripe_secret_key: str = Field(default="")
    stripe_webhook_secret: str = Field(default="")
    stripe_pro_monthly_price_id: str = Field(default="")
    stripe_pro_yearly_price_id: str = Field(default="")
    stripe_enterprise_monthly_price_id: str = Field(default="")
    stripe_enterprise_yearly_price_id: str = Field(default="")

    # --- Uploads ---
    upload_dir: str = Field(default="./uploads")
    max_upload_size_mb: int = Field(default=20)
    allowed_upload_extensions: tuple[str, ...] = (".pdf", ".docx", ".txt", ".csv")

    # --- Usage limits (requests/month, documents) per plan ---
    free_plan_requests_per_month: int = Field(default=20)
    free_plan_document_limit: int = Field(default=5)
    pro_plan_requests_per_month: int = Field(default=500)
    pro_plan_document_limit: int = Field(default=100)
    enterprise_plan_requests_per_month: int = Field(default=5000)
    enterprise_plan_document_limit: int = Field(default=1000)

    # --- Logging ---
    log_level: str = Field(default="INFO")

    # --- CORS ---
    cors_allow_origins: str = Field(default="http://localhost:5173,http://localhost:3000")

    # --- Auth cookies ---
    # Access/refresh tokens are delivered as httpOnly cookies so client-side
    # JS (and therefore an XSS payload) can never read them — the previous
    # approach of the frontend storing tokens in localStorage was flagged
    # by security review as vulnerable to token theft via XSS.
    auth_cookie_domain: str = Field(default="")  # empty = current host only
    auth_cookie_samesite: str = Field(default="lax")  # lax | strict | none

    @property
    def auth_cookie_secure(self) -> bool:
        # Browsers refuse `Secure` cookies over plain http, which is how
        # local development runs — only require it once actually deployed.
        return self.is_production

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]

    def validate_secrets(self) -> list[str]:
        """Return human-readable warnings about missing critical secrets."""
        problems: list[str] = []
        if not self.secret_key:
            problems.append("SECRET_KEY is not set.")
        if not self.jwt_secret_key:
            problems.append("JWT_SECRET_KEY is not set.")
        if not self.google_api_key:
            problems.append("GOOGLE_API_KEY is not set — agent execution will fail.")
        if not self.stripe_secret_key:
            problems.append("STRIPE_SECRET_KEY is not set — payment endpoints will fail.")
        if not self.stripe_webhook_secret:
            problems.append("STRIPE_WEBHOOK_SECRET is not set — webhook signature checks will fail.")
        return problems


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
