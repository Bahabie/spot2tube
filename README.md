<div align="center">

# **Spot2TubeSync**

**Spotify to YouTube Music Synchronization**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg?style=for-the-badge)](https://www.python.org/downloads/release/python-3120/)
[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black.svg?style=for-the-badge)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST-009688.svg?style=for-the-badge)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=for-the-badge)](https://supabase.com/)
[![Queue: PGMQ](https://img.shields.io/badge/Queue-PGMQ-indigo.svg?style=for-the-badge)](https://github.com/tembo-io/pgmq)

</div>

## Overview

**Spot2TubeSync** is an open-source, fully automated SaaS utility designed to seamlessly transfer and synchronize Spotify playlists directly to YouTube Music accounts. Engineered with a strict adherence to API quotas and data integrity, the system abstracts the underlying complexity of cross-platform entity matching. 

Whether you are switching streaming platforms or simply backing up your music, Spot2TubeSync handles the heavy lifting of matching songs, managing rate limits, and creating identical playlists on YouTube Music. The user interface embodies a premium "dark glassmorphism" aesthetic, utilizing deep space black backgrounds accentuated by ambient purple and indigo luminescences to deliver a highly professional user experience.

## What It Can Do (Features)

*   **Automated Playlist Migration:** Seamlessly map and transfer extensive track lists (even thousands of songs) from Spotify to YouTube Music with a single click.
*   **High-Accuracy Song Matching:** Automatically searches and matches Spotify tracks to their exact YouTube Music counterparts using artist names, track titles, and album data.
*   **Real-Time Progress Tracking:** Sub-second UI updates via WebSocket subscriptions keep you informed on the transfer status, showing exactly which songs are currently being processed.
*   **Intelligent Quota Management:** Built-in exponential backoff algorithms ensure compliance with strict Spotify and YouTube API rate limits.
*   **Secure Authentication:** Dual-boundary authentication utilizing Auth.js v5 and Supabase Auth. Your tokens are encrypted and handled securely.
*   **Background Processing:** You can close the tab while a transfer is happening. The background worker queue (PGMQ) continues processing your playlists autonomously.

## How It Works (Under the Hood)

The synchronization process relies on a robust queue-based architecture:
1. **Authentication:** The user logs in via Spotify OAuth to grant read access to their playlists, and via Google OAuth to grant write access to their YouTube Music account.
2. **Playlist Selection:** The frontend fetches the user's Spotify playlists. The user selects which playlist they want to transfer.
3. **Job Queueing:** When a transfer starts, the frontend sends a request to the FastAPI backend. The backend creates a job in the PostgreSQL Message Queue (PGMQ) and immediately responds to the frontend.
4. **Background Processing:** A dedicated Python background worker polls PGMQ. It picks up the job, fetches all tracks from the Spotify playlist, and iterates through them.
5. **Cross-Platform Matching:** For each track, the worker uses the YouTube Music API to search for the closest match. It evaluates the metadata (artist, title, duration) to find the correct video/audio ID.
6. **Playlist Population:** Matched tracks are batched and inserted into a newly created YouTube Music playlist.
7. **Real-time Feedback:** As the worker processes tracks, it updates the job status in Supabase. The Next.js frontend listens to these changes via Supabase Realtime (WebSockets) and animates the progress bar.

## System Architecture & Technology Stack

The architecture is explicitly decoupled, relying on a stateless backend and a reactive frontend. To maintain operational simplicity and reduce infrastructure overhead, the system intentionally eschews external message brokers (e.g., Redis, Celery, Bull) in favor of PostgreSQL-native queueing (PGMQ).

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS | Reactive UI utilizing Server Components; styled with dark glassmorphism. |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2 | Fully stateless REST API handling core business logic and request validation. |
| **Database** | Supabase (PostgreSQL) | Primary persistence layer enforcing Row Level Security (RLS) without ORM abstraction. |
| **Authentication** | Auth.js v5 & Supabase Auth | Dual-boundary auth: Spotify OAuth PKCE on the frontend; Supabase token verification on the backend. |
| **Background Jobs**| PGMQ (PostgreSQL Message Queue) | High-throughput, PostgreSQL-native queue processor managing asynchronous transfers. |
| **Integrations** | Spotify Web API, YouTube Data API, `ytmusicapi` | External interfaces for cross-platform data extraction and mutation. |

## Quick Start Guide

### Prerequisites
Ensure your local environment is equipped with the following toolchain:
*   `pyenv` (Configured for Python 3.12+)
*   `fnm` (Configured for Node 20+)
*   `pnpm` (Corepack enabled)
*   `Supabase CLI`

### Step 1: Environment Variables & API Keys
You need to create API keys for Spotify, Google (YouTube), and Supabase.

1. **Spotify API:** Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), create an app, and get the Client ID and Secret. Add `http://127.0.0.1:3000/api/auth/callback/spotify` to the Redirect URIs.
2. **Google/YouTube API:** Go to the [Google Cloud Console](https://console.cloud.google.com/), enable the YouTube Data API v3, create OAuth 2.0 Client credentials, and get the Client ID and Secret. Add `http://127.0.0.1:3000/api/auth/callback/google` to the Redirect URIs.
3. **Supabase:** Create a new project on [Supabase](https://supabase.com). Get your URL, Anon Key, and Service Role Key from the Project Settings -> API.

Copy the example environment files and fill them in:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Step 2: Database Setup
Apply the database migrations to your Supabase project using the CLI:
```bash
supabase link --project-ref your-project-id
supabase db push
```

### Step 3: Local Deployment Topology

The local development environment requires three concurrent terminal sessions to operate the separated topological layers.

**Terminal 1: Backend API (FastAPI) Server**  
Initializes the stateless REST web server.
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
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
Initializes the reactive web application.
```bash
cd frontend
fnm use 20
pnpm install
pnpm dev
```

Once all three processes report healthy initialization, navigate to `http://127.0.0.1:3000` in your web browser to initiate a transfer synchronization.

## Contributing

We welcome contributions from the community! If you would like to improve spot2tube-sync, please open an issue to discuss your ideas or submit a pull request with your proposed changes. Ensure all code follows the established architectural principles.

## License

Distributed under the MIT License. Copyright &copy; 2026.
