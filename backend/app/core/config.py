from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """Application settings and configuration"""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./easyshare.db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]

    # Frontend URL for share links
    FRONTEND_URL: str = "http://localhost:5173"

    # Share settings
    SHARE_CODE_LENGTH: int = 9
    SHARE_EXPIRY_HOURS: int = 24
    MAX_FILE_SIZE_MB: int = 1000

    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Easy Share API"
    VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


settings = Settings()
