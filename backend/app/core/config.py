from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    auth_secret: str

    # Direct DB connection string for asyncpg (use port 6543 for Supabase pgBouncer)
    database_url: str

    spotify_client_id: str
    spotify_client_secret: str

    google_client_id: str
    google_client_secret: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
