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

Screenshots:

<img width="395" height="802" alt="Image" src="https://github.com/user-attachments/assets/01e1022f-c384-4541-8477-2454f2cc54ca" />
<img width="396" height="800" alt="Image" src="https://github.com/user-attachments/assets/70445c94-5f87-423c-b0e7-a718de95e119" />
<img width="398" height="804" alt="Image" src="https://github.com/user-attachments/assets/050cc21f-fea3-4084-a676-435564a30fc8" />
<img width="391" height="804" alt="Image" src="https://github.com/user-attachments/assets/f6462d49-9cb8-4c28-9dc3-8b667541af5d" />
<img width="386" height="800" alt="Image" src="https://github.com/user-attachments/assets/750ac2ca-1f70-4c43-b18d-14cd507c660d" />
<img width="407" height="806" alt="Image" src="https://github.com/user-attachments/assets/54529e34-4ca7-4978-af2b-00672199823f" />
