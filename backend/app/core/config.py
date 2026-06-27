from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "CP OS API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api"

    # Database
    database_url: str = "postgresql+asyncpg://cpuser:cppassword@localhost:5432/cpos"
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Redis
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 900  # 15 minutes

    # Auth (NextAuth / Auth.js)
    nextauth_secret: str = "your-nextauth-secret"

    # Codeforces
    cf_api_key: Optional[str] = None
    cf_api_secret: Optional[str] = None
    cf_base_url: str = "https://codeforces.com/api"

    # Gemini AI
    gemini_api_key: Optional[str] = None

    # Discord
    discord_webhook_url: Optional[str] = None

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
