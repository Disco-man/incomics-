# INCOMICS

Accessible comic reading platform for deaf, blind, and disabled readers. It provides audio narration, accessibility settings, AI voice navigation, and even export to Braille.

## Quick start

**Requirements:** Docker Desktop, Node.js 18+ (for local dev)

1. Copy `.env` files and set `OPENAI_API_KEY` in the root `.env` (used by the API for voice commands).
2. Start everything:

```bash
docker-compose --profile dev up -d --build
```

| Service    | URL |
|------------|-----|
| Frontend   | http://localhost:8100 |
| Backend API | http://localhost:3333/api |
| PostgreSQL | localhost:5433 |

**Demo accounts** (seeded on first run):

| Login   | Password | Role  |
|---------|----------|-------|
| `torgyn` | `12345`  | admin |
| `user1`  | `12345`  | user  |

Stop services: `docker-compose --profile dev down`

## Usage

1. Open http://localhost:8100 and **log in** or **register**.
2. Use the bottom tabs:
   - **Home** — platform overview and featured comics
   - **Comics** — browse the library
   - **Profile** — theme, text size, contrast, and accessibility preferences
3. Open a comic to read pages with **auto-play audio**, speed control, and page navigation.
4. Use the **voice navigator** (microphone button) to navigate by voice — e.g. open comics, go home, next/previous page, toggle dark theme, or adjust accessibility settings.

Admins can open **Admin** to manage comics and use the comic constructor.

## Local development (without Docker)

```bash
# Frontend
npm install --legacy-peer-deps
npm run dev

# Backend (separate terminal; PostgreSQL must be running on port 5433)
cd backend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:3333/api` in `.env` and matching DB/JWT vars in `backend/.env`.

For Docker ops, troubleshooting, and full voice-command list, see [doc.md](doc.md).
