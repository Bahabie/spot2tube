-- ============================================================================
-- Phase 2 Migration: spot2tube-sync
-- Target: Supabase PostgreSQL (with PGMQ extension)
-- Run this in Supabase SQL Editor or via: supabase db push
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- PART A: next_auth schema (Auth.js v5 / Supabase Adapter)
-- ────────────────────────────────────────────────────────────────────────────
-- Column names use camelCase because the @auth/supabase-adapter expects
-- them verbatim. Do NOT rename.

CREATE SCHEMA IF NOT EXISTS next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL   ON SCHEMA next_auth TO postgres;

-- A.1  Users ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS next_auth.users (
    id              uuid        NOT NULL DEFAULT uuid_generate_v4(),
    name            text,
    email           text,
    "emailVerified" timestamptz,
    image           text,

    CONSTRAINT users_pkey   PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

-- A.2  Accounts (OAuth provider link + token storage) ────────────────────────

CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id                  uuid    NOT NULL DEFAULT uuid_generate_v4(),
    type                text    NOT NULL,
    provider            text    NOT NULL,
    "providerAccountId" text    NOT NULL,
    refresh_token       text,
    access_token        text,
    expires_at          bigint,
    token_type          text,
    scope               text,
    id_token            text,
    session_state       text,
    "userId"            uuid    NOT NULL,

    CONSTRAINT accounts_pkey        PRIMARY KEY (id),
    CONSTRAINT provider_unique      UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fk" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;
GRANT ALL ON TABLE next_auth.accounts TO service_role;

-- A.3  Sessions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id             uuid        NOT NULL DEFAULT uuid_generate_v4(),
    "sessionToken" text        NOT NULL,
    "userId"       uuid        NOT NULL,
    expires        timestamptz NOT NULL,

    CONSTRAINT sessions_pkey         PRIMARY KEY (id),
    CONSTRAINT sessiontoken_unique   UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fk"  FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;
GRANT ALL ON TABLE next_auth.sessions TO service_role;

-- A.4  Verification Tokens ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier text,
    token      text        NOT NULL,
    expires    timestamptz NOT NULL,

    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_identifier_unique  UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;

-- A.5  Helper: uid() for RLS ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION next_auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), ''),
        (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;


-- ────────────────────────────────────────────────────────────────────────────
-- PART B: public schema (Application domain tables)
-- ────────────────────────────────────────────────────────────────────────────

-- B.1  track_mappings ────────────────────────────────────────────────────────
-- Global ISRC → YouTube Video ID cache. Protects YouTube API quota.

CREATE TABLE IF NOT EXISTS public.track_mappings (
    id               uuid        NOT NULL DEFAULT gen_random_uuid(),
    spotify_isrc     text        NOT NULL,
    youtube_video_id text        NOT NULL,
    confidence       smallint    NOT NULL DEFAULT 100,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT track_mappings_pkey PRIMARY KEY (id),
    CONSTRAINT isrc_unique         UNIQUE (spotify_isrc)
);

CREATE INDEX IF NOT EXISTS idx_track_mappings_updated
    ON public.track_mappings (updated_at);

-- B.2  sync_jobs ─────────────────────────────────────────────────────────────

CREATE TYPE public.sync_job_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);

CREATE TABLE IF NOT EXISTS public.sync_jobs (
    id                  uuid              NOT NULL DEFAULT gen_random_uuid(),
    user_id             uuid              NOT NULL,
    spotify_playlist_id text              NOT NULL,
    youtube_playlist_id text,
    status              sync_job_status   NOT NULL DEFAULT 'PENDING',
    total_tracks        integer           NOT NULL DEFAULT 0,
    processed_tracks    integer           NOT NULL DEFAULT 0,
    failed_tracks       integer           NOT NULL DEFAULT 0,
    progress_percentage smallint          NOT NULL DEFAULT 0,
    error_message       text,
    created_at          timestamptz       NOT NULL DEFAULT now(),
    started_at          timestamptz,
    completed_at        timestamptz,

    CONSTRAINT sync_jobs_pkey    PRIMARY KEY (id),
    CONSTRAINT sync_jobs_user_fk FOREIGN KEY (user_id)
        REFERENCES next_auth.users (id) ON DELETE CASCADE,
    CONSTRAINT progress_range    CHECK (progress_percentage BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_user_status
    ON public.sync_jobs (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_status
    ON public.sync_jobs (status) WHERE status IN ('PENDING', 'PROCESSING');


-- ────────────────────────────────────────────────────────────────────────────
-- PART C: Row-Level Security (RLS)
-- ────────────────────────────────────────────────────────────────────────────

-- C.1  accounts — Block frontend entirely
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;

-- C.2  sync_jobs — Users see/create only their own jobs
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync jobs"
    ON public.sync_jobs
    FOR SELECT
    TO authenticated
    USING (user_id = next_auth.uid());

CREATE POLICY "Users can insert their own sync jobs"
    ON public.sync_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = next_auth.uid());

-- C.3  track_mappings — Read-only for authenticated users
ALTER TABLE public.track_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read track mappings"
    ON public.track_mappings
    FOR SELECT
    TO authenticated
    USING (true);
