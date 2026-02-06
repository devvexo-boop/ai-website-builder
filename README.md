# AI Website Builder (Full Stack)

A professional AI-powered website builder inspired by v0/lovable/bolt/cursor UX. Users describe a site and get complete runnable HTML/CSS/JS with instant live preview, editable Monaco files, project history, and ZIP export.

## Project Structure

```bash
ai-website-builder/
├── frontend/   # React + Vite app
└── backend/    # Node + Express API
```

## Features

### Frontend
- Dark futuristic gaming UI with smooth transitions and responsive layout
- Prompt input + Generate / Regenerate flow
- Loading indicator while AI generates output
- Monaco editor integration (VS Code-like)
- Multi-file tabs and file tree (`index.html`, `styles.css`, `script.js`)
- Editable code in-browser with instant iframe live preview
- Copy per file and Download ZIP support
- Project naming and local history saved in browser localStorage
- Theme switcher (dark/light)

### Backend
- Express API with `POST /generate`
- OpenAI integration using environment variable API key
- Strict JSON output contract validation (`html`, `css`, `js`)
- Input sanitization and prompt-injection guard checks
- Rate limiting on generation endpoint
- Body/file size limits and safe error handling

## Local Setup

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# add OPENAI_API_KEY
npm run dev
```

Backend runs on `http://localhost:3001`.

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Contract

### `POST /generate`
Request:

```json
{
  "prompt": "Create a dark gaming portfolio website with animations"
}
```

Response:

```json
{
  "html": "<!doctype html>...",
  "css": "body {...}",
  "js": "const app = ..."
}
```

## Deploy

### Frontend (Vercel/Netlify)
1. Set root to `frontend/`
2. Build command: `npm run build`
3. Output: `dist`
4. Env var: `VITE_API_BASE=https://your-backend-domain`

### Backend (Render/Railway/Fly.io)
1. Set root to `backend/`
2. Start command: `npm start`
3. Add env vars:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
   - `CORS_ORIGIN`

## Example Prompts

- "Create a dark gaming portfolio website with neon animations and a projects section."
- "Build a SaaS landing page with pricing, testimonials, and CTA buttons."
- "Generate a multi-section restaurant website with menu cards and reservation form."
- "Create a futuristic AI startup homepage with animated gradients and scroll effects."

## Notes
- AI is instructed to return code-only JSON and no explanations.
- Generated projects are stored in browser local storage (latest 20).
- ZIP export includes all current files from the editor.
