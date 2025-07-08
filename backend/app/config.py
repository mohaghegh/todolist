from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "postgresql://user:password@localhost/todolist_db"
    database_test_url: str = "postgresql://user:password@localhost/todolist_test_db"

    # JWT Configuration
    secret_key: str = "your-secret-key-here-make-it-long-and-secure"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"

    # Application Configuration
    app_name: str = "TodoList API"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"

    # CORS Configuration
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # Pagination
    default_page_size: int = 20
    max_page_size: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings()
