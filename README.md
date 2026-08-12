<div align="center">

# spot2tube-sync

**Spotify to YouTube Music Synchronization**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg?style=for-the-badge)](https://www.python.org/downloads/release/python-3120/)
[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black.svg?style=for-the-badge)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST-009688.svg?style=for-the-badge)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=for-the-badge)](https://supabase.com/)
[![Queue: PGMQ](https://img.shields.io/badge/Queue-PGMQ-indigo.svg?style=for-the-badge)](https://github.com/tembo-io/pgmq)

</div>

## Overview

**spot2tube-sync** is an open source, fully automated SaaS utility designed to seamlessly transfer and synchronize Spotify playlists directly to YouTube Music accounts. Engineered with a strict adherence to API quotas and data integrity, the system abstracts the underlying complexity of cross platform entity matching. The user interface embodies a premium "dark glassmorphism" aesthetic, utilizing deep space black backgrounds (`#0A0A0B`) accentuated by ambient purple and indigo luminescences to deliver a highly professional user experience.

## Core Features

*   **Automated Playlist Migration:** Seamlessly map and transfer extensive track lists from Spotify to YouTube Music.
*   **Real Time Progress Tracking:** Sub second UI updates via WebSocket subscriptions keep you informed on transfer status.
*   **Intelligent Quota Management:** Built in exponential backoff algorithms ensure compliance with strict API rate limits.
*   **Secure Authentication:** Dual boundary authentication utilizing Auth.js v5 and Supabase Auth.
*   **Premium Aesthetics:** A visually striking interface built with Tailwind CSS and Next.js.

## System Architecture & Technology Stack

The architecture is explicitly decoupled, relying on a stateless backend and a reactive frontend. To maintain operational simplicity and reduce infrastructure overhead, the system intentionally eschews external message brokers (e.g., Redis, Celery, Bull) in favor of PostgreSQL native queueing (PGMQ).

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS | Reactive UI utilizing Server Components; styled with dark glassmorphism. |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2 | Fully stateless REST API handling core business logic and request validation. |
| **Database** | Supabase (PostgreSQL) | Primary persistence layer enforcing Row Level Security (RLS) without ORM abstraction. |
| **Authentication** | Auth.js v5 & Supabase Auth | Dual boundary auth: Spotify OAuth PKCE on the frontend; Supabase token verification on the backend. |
| **Background Jobs**| PGMQ (PostgreSQL Message Queue) | High throughput, PostgreSQL native queue processor managing asynchronous transfers. |
| **Integrations** | Spotify Web API, YouTube Data API, `ytmusicapi` | External interfaces for cross platform data extraction and mutation. |

## Performance Optimizations

The system integrates several critical optimizations to guarantee high throughput and reliability under strict third party rate limits:

1. **HTTPX Connection Pooling:** Mitigates the overhead of repetitive TCP/TLS handshakes when communicating with the YouTube API, reducing song transfer latency by 20% to 50%.
2. **N+1 Query Resolution via Batching:** Supabase progress mutations are batched in groups of 10 rather than executed per individual track, resulting in a 90% reduction in network I/O overhead.
3. **WebSocket Driven State Mutability:** Replaces inefficient HTTP polling with Supabase Realtime (WebSocket) subscriptions, ensuring the frontend progress indicators reflect sub second state changes without overwhelming the backend.
4. **Memory Management & Quota Backoff Algorithms:** Large scale playlists are processed using asynchronous generators to maintain a minimal memory footprint. The background worker implements exponential backoff with jitter to strictly respect Spotify (`Retry After`) and YouTube (10,000 units/day) API quotas.

## Quick Start Guide

### Prerequisites
Ensure your local environment is equipped with the following toolchain:
*   `pyenv` (Configured for Python 3.12+)
*   `fnm` (Configured for Node 20+)
*   `pnpm` (Corepack enabled)
*   `Supabase CLI`

### Local Deployment Topology

The local development environment requires three concurrent terminal sessions to operate the separated topological layers.

**Terminal 1: Backend API (FastAPI) Server**  
Initializes the stateless REST web server.
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2: Background Job Worker (PGMQ)**  
Initializes the asynchronous consumer loop that dequeues and processes the playlist transfer operations.
```bash
cd backend
source venv/bin/activate
python -m app.worker.job_processor
```

**Terminal 3: Frontend (Next.js) Server**  
Initializes the reactive web application. *(Note: Using Node v22 as recommended for local dev)*
```bash
cd frontend
fnm use 22
pnpm dev
```

Once all three processes report healthy initialization, navigate to `http://127.0.0.1:3000` in your web browser to initiate a transfer synchronization. If you encounter any anomalous behavior, please provide the relevant terminal traces for diagnostic review.

## Contributing

We welcome contributions from the community! If you would like to improve spot2tube-sync, please open an issue to discuss your ideas or submit a pull request with your proposed changes. Ensure all code follows the established architectural principles.

## License

Distributed under the MIT License. Copyright &copy; 2026 Bahabie.
