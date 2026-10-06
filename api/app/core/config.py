"""Settings from environment variables / `.env`. No secrets live in code."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_title: str = "AirFone API"
    project_version: str = "2.0.0"

    # SQLite by default (zero setup); MySQL in Docker: mysql+pymysql://user:pass@db:3306/airfone
    database_url: str = "sqlite:///./airfone.db"

    secret_key: str = Field(default="dev-only-insecure-secret-change-me", min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    password_reset_expire_minutes: int = 30

    # Origins allowed to call the API from a browser (the Angular dev server by default).
    cors_origins: list[str] = ["http://localhost:4200"]
    # Public URL of the web app, used in password-reset links.
    web_base_url: str = "http://localhost:4200"

    # Optional real e-mail delivery. When smtp_host is empty, messages are only stored in
    # the notifications outbox (and logged), which is what development and tests use.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = "AirFone <no-reply@airfone.example>"

    seed_demo_data: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
