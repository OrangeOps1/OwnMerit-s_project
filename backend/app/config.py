from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Own Merits API"
    environment: str = "development"
    api_prefix: str = "/api"
    auto_seed_data: bool = True
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    session_expiry_hours: int = 24

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "ownmerits"

    minimax_api_key: str = ""
    minimax_base_url: str = "https://api.minimax.io"
    minimax_model: str = "abab6.5-chat"

    evoucher_api_key: str = ""
    evoucher_base_url: str = "https://api.example-voucher.com"

    google_calendar_client_id: str = ""
    google_calendar_client_secret: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
