# AI Website Builder (React + Vite + Express + OpenAI)

A full-stack AI website builder that turns plain-language prompts into production-ready web projects.

## Folder Structure

```txt
frontend/   React + Vite UI (Monaco editor, preview, history, zip)
backend/    Express API for AI code generation
```

## What You Get

### Frontend
- Futuristic dark UI inspired by v0/lovable/bolt/cursor
- Prompt input + Generate and Regenerate
- Loading state while generation runs
- Monaco editor with multi-file tabs
- Editable code that updates live preview instantly
- Copy file content + Download project ZIP
- Project naming system + local project history sidebar
- Theme switcher (dark/light)
- Single-page and multi-page generation mode toggle
- File tree with add/remove files

### Backend
- `POST /generate` endpoint
- OpenAI integration via environment variables
- Strong schema validation for input/output
- Sanitization and prompt-injection guard checks
- Request payload size limit
- Rate limiting on generation endpoint
- Safe error responses

## API Response Shape

The backend enforces the AI response to include:

```json
{
  "html": "...",
  "css": "...",
  "js": "..."
}
```

It also supports optional `files` for advanced multi-page output:

```json
{
  "html": "...",
  "css": "...",
  "js": "...",
  "files": {
    "index.html": "...",
    "about.html": "...",
    "styles.css": "...",
    "script.js": "..."
  }
}
```

## Local Setup

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# Set OPENAI_API_KEY in .env
npm run dev
```

API runs at `http://localhost:3001`.

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)
- `OPENAI_API_KEY` (required)
- `OPENAI_MODEL` (optional, default `gpt-4.1-mini`)
- `PORT` (default `3001`)
- `CORS_ORIGIN` (default all origins)

### Frontend (`frontend/.env`)
- `VITE_API_BASE` (example: `http://localhost:3001`)

## Deployment

### Frontend (Vercel/Netlify)
- Root: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE=https://your-api-domain`

### Backend (Render/Railway/Fly)
- Root: `backend`
- Start command: `npm start`
- Add env vars listed above

## Example Prompts

- `Create a dark gaming portfolio website with animated hero text and project cards.`
- `Build a modern SaaS landing page with pricing tiers, FAQ, testimonials, and CTA.`
- `Generate a multi-page restaurant site with home, menu, and contact pages.`
- `Create a cyberpunk dev agency website with smooth scroll animations.`
