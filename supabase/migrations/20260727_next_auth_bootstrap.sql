-- ============================================================================
-- Auth.js v5 / @auth/supabase-adapter — Full Schema Bootstrap
-- Target: Supabase PostgreSQL (remote, via SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS throughout.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 0. Enable required extension (uuid_generate_v4)
-- ────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Create the next_auth schema
-- ────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL   ON SCHEMA next_auth TO postgres;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Tables — exact column names expected by @auth/supabase-adapter
--    camelCase columns are MANDATORY. Do NOT rename them.
-- ────────────────────────────────────────────────────────────────────────────

-- 2.1 users
CREATE TABLE IF NOT EXISTS next_auth.users (
    id              uuid        NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name            text,
    email           text,
    "emailVerified" timestamptz,
    image           text,

    CONSTRAINT users_pkey   PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

-- 2.2 accounts
CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id                  uuid    NOT NULL DEFAULT extensions.uuid_generate_v4(),
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

-- 2.3 sessions
CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id             uuid        NOT NULL DEFAULT extensions.uuid_generate_v4(),
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

-- 2.4 verification_tokens
CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier text,
    token      text        NOT NULL,
    expires    timestamptz NOT NULL,

    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_identifier_unique  UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Default privileges — auto-grant on future objects in next_auth
-- ────────────────────────────────────────────────────────────────────────────

ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth
    GRANT ALL ON TABLES    TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth
    GRANT ALL ON SEQUENCES TO postgres, service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Helper function: next_auth.uid()
--    Extracts the authenticated user's UUID from the Supabase JWT for RLS.
-- ────────────────────────────────────────────────────────────────────────────

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
-- 5. Row-Level Security
--    The adapter operates via the service_role key which BYPASSES RLS.
--    These policies protect against direct PostgREST access via anon/auth.
-- ────────────────────────────────────────────────────────────────────────────

-- 5.1 users — block anon/authenticated from direct reads
ALTER TABLE next_auth.users ENABLE ROW LEVEL SECURITY;

-- 5.2 accounts — block anon/authenticated entirely
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;

-- 5.3 sessions — block anon/authenticated entirely
ALTER TABLE next_auth.sessions ENABLE ROW LEVEL SECURITY;

-- 5.4 verification_tokens — block anon/authenticated entirely
ALTER TABLE next_auth.verification_tokens ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Verification query — run this SELECT after the migration to confirm
-- ────────────────────────────────────────────────────────────────────────────

-- SELECT table_schema, table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'next_auth'
-- ORDER BY table_name;
--
-- Expected output:
-- next_auth | accounts
-- next_auth | sessions
-- next_auth | users
-- next_auth | verification_tokens
