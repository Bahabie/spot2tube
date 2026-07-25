# AGENTS.md — AI Coding Agent Rulebook

> **Audience:** AI coding agents only. Human onboarding lives in `README.md`.
> This file governs how agents navigate, build, test, and maintain the `spot2tube-sync` codebase.

---

## 1. Project Overview (Agent Focus)

**spot2tube-sync** is a multi-tenant SaaS that transfers and syncs Spotify playlists to YouTube Music accounts.

### System Topology

```
User Browser ──▶ Next.js (App Router) ──▶ FastAPI ──▶ Supabase (PostgreSQL + PGMQ)
                      │                        │                │
                 Auth.js v5              ytmusicapi         Background
                 (OAuth sessions)        (YT Music)         Job Queue
                      │                        │                │
                 Spotify Web API         YouTube Data API    PGMQ Worker
```

### Tech-Stack Constraints

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | All UI in `frontend/` |
| Backend | Python 3.12+, FastAPI, Pydantic v2 | All API in `backend/` |
| Auth | Auth.js v5 (frontend), Supabase Auth (backend) | Dual auth boundary |
| Database | Supabase (PostgreSQL) | RLS enforced per-user |
| Job Queue | **PGMQ** (PostgreSQL-native) | **NOT Redis/Celery** |
| YT Music | `ytmusicapi` | Unofficial; no Google OAuth for playback writes |
| Spotify | Spotify Web API | Standard OAuth 2.0 PKCE |

> **Critical:** This project uses **PGMQ** (Postgres Message Queue via Supabase) for background job processing — **not** Redis or Celery. Never introduce Redis, Celery, Bull, or any external broker dependency.

---

## 2. Agent Behavior Rules

### 2.1 Investigate Before Writing

```
MANDATORY: Read the target file and its direct imports BEFORE writing any code.
           Do NOT generate code from memory or speculation.
```

- Use file-reading tools to inspect existing context, imports, and variables.
- If a file is empty (scaffold), read sibling files and parent `__init__.py` / `index.ts` for conventions.

### 2.2 Anti-Overengineering

- Do **NOT** add abstractions unless explicitly requested (no generic repository patterns, abstract factories, adapter layers, etc.).
- Keep every file under **150–200 lines**. If a file exceeds this, split by responsibility.
- Follow the Single Responsibility Principle — one module, one job.
- Prefer flat, explicit code over clever indirection.

### 2.3 Scratchpad Hygiene

- If you create temporary files (test scripts, debug helpers, data dumps) during a task, you **MUST** delete them as the final step before completing the task.
- Never commit scratch files. Never leave orphan `test_*.py` or `debug_*.ts` files in the workspace.

### 2.4 Communication Style

- Use concise, imperative language in code comments.
- Do **NOT** add redundant docstrings to functions that are not being created or modified.
- Preserve all existing comments unrelated to your changes.

---

## 3. Dev Environment & Commands

### 3.1 Prerequisites

| Tool | Purpose | Install / Activate |
|---|---|---|
| `pyenv` | Python version management | `pyenv install 3.12 && pyenv local 3.12` |
| `fnm` | Node.js version management | `fnm use 20` |
| `pnpm` | Node package manager | `corepack enable && corepack prepare pnpm@latest --activate` |
| Supabase CLI | Local DB + PGMQ | `brew install supabase/tap/supabase` |

### 3.2 Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload --port 8000

# Run the PGMQ worker (separate terminal, same venv)
python -m app.worker.job_processor
```

### 3.3 Frontend Setup

```bash
cd frontend
fnm use 20
pnpm install

# Run the dev server
pnpm dev
```

### 3.4 Environment Variables

- **Backend:** `backend/.env` — Supabase URL, Supabase anon/service key, Spotify client credentials, YouTube API key.
- **Frontend:** `frontend/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Auth.js secret, Spotify client ID.
- **Never** hardcode secrets. Always read from env files.
- **Never** commit `.env` files (already in `.gitignore`).

---

## 4. Architecture & Code Style

### 4.1 Monorepo Layout

```
spot2tube-sync/
├── backend/                    # Python / FastAPI
│   ├── app/
│   │   ├── api/                # Routes & dependency injection
│   │   │   ├── routes.py       # All FastAPI endpoint definitions
│   │   │   └── dependencies.py # Depends() factories
│   │   ├── core/               # Cross-cutting: config, security
│   │   │   ├── config.py       # Pydantic Settings (env parsing)
│   │   │   └── security.py     # Token validation, hashing
│   │   ├── db/                 # Database layer
│   │   │   ├── session.py      # Supabase client factory
│   │   │   └── pgmq.py         # PGMQ queue operations
│   │   ├── models/             # Pydantic schemas (request/response)
│   │   ├── services/           # Business logic (stateless)
│   │   │   ├── auth_service.py
│   │   │   ├── spotify_client.py
│   │   │   ├── youtube_client.py
│   │   │   └── ytmusic_scraper.py
│   │   ├── worker/             # Background job processing
│   │   │   ├── job_processor.py  # PGMQ consumer loop
│   │   │   └── task_handlers.py  # Per-task business logic
│   │   └── main.py             # FastAPI app factory
│   ├── tests/                  # pytest test suite
│   ├── requirements.txt
│   └── .env
│
├── frontend/                   # Next.js / TypeScript
│   ├── src/
│   │   ├── app/                # Next.js App Router (layouts, pages)
│   │   │   └── api/auth/[...nextauth]/
│   │   │       └── route.ts    # Auth.js route handler
│   │   ├── components/         # Shared, reusable UI components
│   │   ├── features/           # Feature-based vertical slices
│   │   │   ├── auth/           # Login, session, OAuth callbacks
│   │   │   ├── spotify/        # Playlist fetching, selection UI
│   │   │   ├── youtube/        # Channel status, connection UI
│   │   │   └── sync-job/       # Job progress, tracking
│   │   ├── lib/                # Shared utilities & SDK clients
│   │   │   ├── auth.ts         # Auth.js v5 config (providers, adapter)
│   │   │   ├── supabase.ts     # Supabase browser/server clients
│   │   │   └── utils.ts        # Generic helpers
│   │   └── types/              # Shared TypeScript type definitions
│   ├── package.json
│   └── .env.local
│
├── supabase/                   # Supabase config & migrations
│   └── migrations/             # SQL migration files
│
└── AGENTS.md                   # This file
```

### 4.2 Feature-Based Architecture Rules

Each `features/<name>/` directory is a **vertical slice** containing everything that feature needs:

| File Pattern | Purpose |
|---|---|
| `api.ts` / `*Api.ts` | API calls (fetch wrappers, Supabase queries) |
| `components.tsx` / `*.tsx` | React components scoped to this feature |
| `hooks.ts` | Custom React hooks for this feature |
| `types.ts` | Feature-local TypeScript types |

**Rules:**
- Features must **NOT** import from other features. Share through `lib/` or `components/`.
- A feature folder is the only place to put domain-specific logic for that domain.
- If two features need the same utility, extract it to `src/lib/`.

### 4.3 Backend Layering Rules

```
routes.py  →  services/  →  db/
   ↓              ↓
dependencies.py  models/
```

- **`api/routes.py`**: Thin HTTP layer. Receives requests, calls services, returns responses. No business logic here.
- **`services/`**: Stateless business logic. Each service receives its dependencies via function arguments (no global state).
- **`db/`**: Database access only. `session.py` for Supabase client, `pgmq.py` for queue operations.
- **`models/`**: Pydantic schemas for request validation and response serialization. No ORM models — Supabase is accessed via its Python client.
- **`worker/`**: PGMQ consumer. `job_processor.py` polls the queue; `task_handlers.py` contains the per-job-type logic.

**Rules:**
- Routes must **NOT** call `db/` directly. Always go through `services/`.
- Services must **NOT** import from `api/`.
- The worker **MUST** use PGMQ (`db/pgmq.py`), never raw SQL polling or external brokers.

### 4.4 Code Style

**Python (Backend):**
- Type hints on **all** function signatures (args + return).
- Use `async def` for all route handlers and IO-bound service functions.
- Use Pydantic `BaseModel` for all data contracts.
- Imports: stdlib → third-party → local, separated by blank lines.
- Naming: `snake_case` for functions/variables, `PascalCase` for classes.

**TypeScript (Frontend):**
- Strict mode enabled. No `any` types unless absolutely unavoidable (and documented with `// TODO: type properly`).
- Use named exports. Avoid default exports except for Next.js page/layout components.
- React components: function declarations (`function Component()`) not arrow functions for top-level components.
- Prefer Server Components. Use `'use client'` only when client interactivity is required.

---

## 5. Testing & Quality Checks

### 5.1 Pre-Modification Check

Before modifying any file, verify the existing test suite is green:

```bash
# Backend
cd backend && source venv/bin/activate
pytest --tb=short -q

# Frontend
cd frontend
pnpm test
```

### 5.2 Writing Tests

- Write unit tests for **every** new or modified function.
- Backend tests go in `backend/tests/`, mirroring the `app/` structure.
- Frontend tests are co-located with their feature: `features/<name>/__tests__/`.

**Backend test example:**
```bash
pytest backend/tests/services/test_spotify_client.py -v
```

**Frontend test example:**
```bash
pnpm test -- --testPathPattern="features/spotify"
```

### 5.3 Linting & Formatting

```bash
# Backend
cd backend && source venv/bin/activate
ruff check app/                    # Lint
ruff format app/                   # Format
mypy app/ --ignore-missing-imports # Type check

# Frontend
cd frontend
pnpm lint                          # ESLint + Next.js rules
pnpm tsc --noEmit                  # TypeScript type check
```

### 5.4 Pre-Commit Checklist

Before staging any commit, the agent MUST verify:

1. `ruff check` and `pnpm lint` pass with zero errors.
2. `pytest` and `pnpm test` pass with zero failures.
3. `mypy` and `tsc --noEmit` produce no type errors.
4. No temporary/scratch files remain in the workspace.

---

## 6. Security & OAuth

### 6.1 Supabase Row-Level Security (RLS)

- **Every** table must have RLS policies that scope data to `auth.uid()`.
- Never bypass RLS with the `service_role` key in frontend code.
- Backend uses the `service_role` key **only** in the PGMQ worker for queue operations, never in user-facing endpoints.

### 6.2 OAuth Token Handling

| Provider | Flow | Storage | Refresh |
|---|---|---|---|
| Spotify | OAuth 2.0 PKCE | Supabase `auth.users` provider tokens | Auto-refresh via Auth.js |
| YouTube Music | `ytmusicapi` headers auth | Encrypted in Supabase, per-user | Manual re-auth on expiry |

**Rules:**
- **Never** log, print, or expose raw access/refresh tokens in API responses or console output.
- **Never** store tokens in frontend `localStorage` or cookies without encryption.
- Token refresh logic must be handled in `services/auth_service.py`, not in route handlers.
- All token-bearing requests to external APIs must use short-lived access tokens, never refresh tokens directly.

### 6.3 API Key Discipline

- All API keys and secrets live exclusively in `.env` files.
- Access them through `core/config.py` (Pydantic Settings) on the backend and `process.env` / `env.local` on the frontend.
- Frontend must only access `NEXT_PUBLIC_*` prefixed variables. Server-only secrets must never be exposed to the client bundle.

---

## 7. Git & Commit Conventions

### 7.1 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

# Examples:
feat(spotify): add playlist fetch endpoint
fix(worker): handle PGMQ timeout on empty queue
refactor(auth): extract token refresh to service layer
chore(deps): bump ytmusicapi to 1.9.0
test(sync-job): add unit tests for job_processor
```

**Valid types:** `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `style`, `perf`, `ci`.
**Valid scopes:** `auth`, `spotify`, `youtube`, `sync-job`, `worker`, `db`, `deps`, `config`.

### 7.2 PR Readiness

- All linting + test checks must pass (see §5.4).
- Each PR should address a single concern. Do not bundle unrelated changes.
- If a PR touches both `backend/` and `frontend/`, clearly separate the changes in the commit history.

---

## 8. Quick Reference for Common Tasks

| Task | Command |
|---|---|
| Start backend API | `cd backend && source venv/bin/activate && uvicorn app.main:app --reload` |
| Start PGMQ worker | `cd backend && source venv/bin/activate && python -m app.worker.job_processor` |
| Start frontend dev | `cd frontend && fnm use 20 && pnpm dev` |
| Run backend tests | `cd backend && source venv/bin/activate && pytest` |
| Run frontend tests | `cd frontend && pnpm test` |
| Lint backend | `cd backend && source venv/bin/activate && ruff check app/` |
| Lint frontend | `cd frontend && pnpm lint` |
| Type-check backend | `cd backend && source venv/bin/activate && mypy app/` |
| Type-check frontend | `cd frontend && pnpm tsc --noEmit` |
| Format backend | `cd backend && source venv/bin/activate && ruff format app/` |