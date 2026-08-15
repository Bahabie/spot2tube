
import asyncpg
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

db_pool: asyncpg.Pool | None = None


@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
async def init_db_pool() -> None:
    """Initialize a globally managed, strictly-bounded asyncpg connection pool."""
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            dsn=settings.database_url,
            min_size=2,
            max_size=10,  # Strict boundary to prevent connection exhaustion under scale
            command_timeout=30.0,
            server_settings={"application_name": "spot2tube-worker"},
        )


async def close_db_pool() -> None:
    """Gracefully close the database pool."""
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None
