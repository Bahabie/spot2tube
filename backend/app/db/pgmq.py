from typing import Any

from app.db.supabase import get_supabase_client

supabase = get_supabase_client()

def read_message(queue_name: str, vt: int = 30) -> dict[str, Any] | None:
    """
    Reads a single message from the queue and hides it for `vt` seconds.
    Assumes an RPC wrapper `pgmq_read` exists in the public schema.
    """
    try:
        response = supabase.rpc("pgmq_read", {"queue_name": queue_name, "vt": vt, "limit_count": 1}).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:  # noqa: BLE001
        print(f"Error reading from PGMQ: {e}")
        return None

def delete_message(queue_name: str, msg_id: int) -> bool:
    """
    Deletes a message from the queue permanently.
    Assumes an RPC wrapper `pgmq_delete` exists in the public schema.
    """
    try:
        response = supabase.rpc("pgmq_delete", {"queue_name": queue_name, "msg_id": msg_id}).execute()
        return bool(response.data)
    except Exception as e:  # noqa: BLE001
        print(f"Error deleting from PGMQ: {e}")
        return False
