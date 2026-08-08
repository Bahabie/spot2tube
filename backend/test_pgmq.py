import asyncio
import os
from dotenv import load_dotenv

load_dotenv("/Users/bahabie/Desktop/spot2tube-sync/backend/.env")

from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

try:
    payload = {"test": "123"}
    res = supabase.rpc("pgmq_send", {"queue_name": "spot2tube_jobs", "message": payload}).execute()
    print("SUCCESS dict:", res.data)
except Exception as e:
    print("ERROR dict:", str(e))

try:
    import json
    res = supabase.rpc("pgmq_send", {"queue_name": "spot2tube_jobs", "message": json.dumps(payload)}).execute()
    print("SUCCESS json:", res.data)
except Exception as e:
    print("ERROR json:", str(e))
