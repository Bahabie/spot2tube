-- Enable the pgmq extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Drop existing wrappers to avoid "cannot change return type" errors
DROP FUNCTION IF EXISTS public.pgmq_send(text, jsonb);
DROP FUNCTION IF EXISTS public.pgmq_read(text, integer, integer);
DROP FUNCTION IF EXISTS public.pgmq_delete(text, bigint);

-- RPC Wrapper to send a message
CREATE OR REPLACE FUNCTION public.pgmq_send(queue_name text, message jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    msg_id bigint;
BEGIN
    SELECT * INTO msg_id FROM pgmq.send(queue_name, message);
    RETURN msg_id;
END;
$$;

-- RPC Wrapper to read a message
CREATE OR REPLACE FUNCTION public.pgmq_read(queue_name text, vt integer, limit_count integer)
RETURNS TABLE (
    msg_id bigint,
    read_ct integer,
    enqueued_at timestamp with time zone,
    vt timestamp with time zone,
    message jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM pgmq.read(queue_name, vt, limit_count);
$$;

-- RPC Wrapper to delete a message
CREATE OR REPLACE FUNCTION public.pgmq_delete(queue_name text, msg_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted boolean;
BEGIN
    SELECT * INTO deleted FROM pgmq.delete(queue_name, msg_id);
    RETURN deleted;
END;
$$;
