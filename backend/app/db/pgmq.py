import json
from typing import Any

import app.db.pool

async def read_message(queue_name: str, vt: int = 30) -> dict[str, Any] | None:
    """Reads a single message from the queue and hides it for `vt` seconds asynchronously."""
    if not app.db.pool.db_pool:
        raise RuntimeError("Database pool not initialized.")

    query = """
        SELECT * FROM pgmq.read($1::text, $2::integer, 1);
    """
    async with app.db.pool.db_pool.acquire() as conn:
        row = await conn.fetchrow(query, queue_name, vt)

    if row:
        message_data = row["message"]
        while isinstance(message_data, str):
            try:
                parsed = json.loads(message_data)
                # Prevent infinite loop if the string is just a quoted string "some string"
                if parsed == message_data or not isinstance(parsed, (dict, list, str)):
                    if isinstance(parsed, (dict, list)):
                        message_data = parsed
                    break
                message_data = parsed
            except json.JSONDecodeError:
                break
        
        if not isinstance(message_data, dict):
            message_data = {}

        return {
            "msg_id": row["msg_id"],
            "message": message_data,
        }
    return None


async def delete_message(queue_name: str, msg_id: int) -> bool:
    """Deletes a message from the queue permanently via the pool."""
    if not app.db.pool.db_pool:
        return False

    query = """
        SELECT pgmq.delete($1::text, $2::bigint);
    """
    try:
        async with app.db.pool.db_pool.acquire() as conn:
            result = await conn.fetchval(query, queue_name, msg_id)
            return bool(result)
    except Exception as e:  # noqa: BLE001
        print(f"Error deleting from PGMQ: {e}")
        return False


async def update_job_status(
    job_id: str, status: str, extra_updates: dict[str, Any] | None = None
) -> None:
    """Helper to update the sync_jobs table efficiently without HTTP overhead."""
    if not app.db.pool.db_pool:
        return

    updates = {"status": status}
    if extra_updates:
        updates.update(extra_updates)

    set_clauses = []
    values: list[Any] = [job_id]

    for i, (key, val) in enumerate(updates.items(), start=2):
        set_clauses.append(f"{key} = ${i}")
        values.append(val)

    query = f"""
        UPDATE public.sync_jobs 
        SET {", ".join(set_clauses)}
        WHERE id = $1;
    """
    async with app.db.pool.db_pool.acquire() as conn:
        await conn.execute(query, *values)
