# THUL – All-in-One Online Tools

React + Vite frontend, FastAPI backend. Six tools: Image→PDF, Image Converter, Image Compressor/Resizer, PDF→Word, YouTube Downloader, Instagram Downloader. Plus optional feedback/ratings stored in SQLite (`backend/thul_feedback.db`).

## 1. Install prerequisites (Windows)
1. **Python 3.10+** – https://python.org (tick "Add Python to PATH").
2. **Node.js 18+ (LTS)** – https://nodejs.org
3. **FFmpeg** (needed for video+audio merging and MP3 extraction):
   - Easiest: in PowerShell run `winget install Gyan.FFmpeg`, then **close and reopen** VS Code.
   - Manual: download a build from https://www.gyan.dev/ffmpeg/builds/, unzip to `C:\ffmpeg`, then add `C:\ffmpeg\bin` to PATH (Start → "Edit the system environment variables" → Environment Variables → Path → New).
   - Check with `ffmpeg -version`. If you can't edit PATH, set `FFMPEG_LOCATION=C:\ffmpeg\bin` in `backend\.env`.

## 2. Run the backend (terminal 1)
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```
Open http://127.0.0.1:8000/api/health – you should see `{"status":"ok","ffmpeg":true,...}`. API docs: http://127.0.0.1:8000/docs
(If PowerShell blocks activation: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.)

## 3. Run the frontend (terminal 2)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. In development Vite proxies `/api` to port 8000, so nothing else needs connecting.

## 4. Test each tool
| Tool | What to try |
|---|---|
| Image to PDF | Add 2–3 images, reorder, convert → PDF downloads |
| Image Converter | Upload PNG → WEBP, compare previews and sizes |
| Compressor/Resizer | Upload a large JPG, set 50 %, quality 75, check "Saved %" |
| PDF to Word | Use a text-based PDF (scanned PDFs are rejected with an explanation) |
| YouTube | Paste a link to a video you're allowed to download → Fetch info → pick format → Prepare download |
| Instagram | Paste a public Reel link you have rights to; private/blocked posts show a clear error |
| Feedback | Give 1–5 stars (comment ≤ 30 words); stats appear on the same page |

## 5. Troubleshooting
- **"Cannot reach the THUL server"** – backend isn't running on port 8000.
- **YouTube/Instagram errors that used to work** – these sites change often. Run `pip install -U yt-dlp` and restart. Instagram often blocks anonymous access; THUL intentionally does not use logins/cookies, so some Reels will fail.
- **Only low quality / no merge** – FFmpeg not found; see step 1 (`/api/health` shows `ffmpeg`).
- **`pip install` fails for PyMuPDF** – `python -m pip install -U pip` and use 64-bit Python.
- **429 Too many requests** – built-in rate limit; wait a minute.
- **Port in use** – change `--port` and the proxy target in `frontend/vite.config.js`.

## 6. Adding a new tool later
1. **Backend (if it needs a server):** copy `backend/app/routers/_template.py` to `backend/app/routers/my_tool.py`. Any file in `routers/` that defines `router` is registered automatically on restart. Put heavy logic in `backend/app/services/`.
2. **Frontend page:** copy `frontend/src/pages/_ToolTemplate.jsx` to `MyTool.jsx`.
3. **Register it:** add one entry in `frontend/src/tools.js` (name, description, icon, category, `component`). The homepage card, search, All Tools page, route and footer link are all generated from that list. For a new category, add its name to `CATEGORIES`.

## 7. Updating the site after you publish
Make changes locally, test, then:
- **Frontend:** `cd frontend && npm run build`, then upload the new `dist/` folder to your static host. If the API is on a different domain, set `VITE_API_URL=https://api.yourdomain.com` in `frontend/.env` before building.
- **Backend:** copy changed files to your server (or `git pull`), `pip install -r requirements.txt`, restart the service. Set `CORS_ORIGINS=https://yourdomain.com` in the server's `.env`.
- Keep the code in Git so every update is small and reversible, and update `yt-dlp` regularly.

## Deployment notes
- Run the backend with `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` behind HTTPS (Nginx/Caddy). Behind a proxy add `--proxy-headers --forwarded-allow-ips="*"` so rate limits see real client IPs.
- Job tracking and rate limits are in memory: use a **single** worker process, or move them to Redis if you scale out.
- Moving feedback to PostgreSQL: only `backend/app/database.py` contains SQL.

## Security & legal summary
Uploads are validated by extension, MIME type and real content; size and pixel limits apply; temp files use random names and are deleted automatically (wipe at startup, sweep every 5 min, 20 min TTL). Media URLs are restricted to YouTube/Instagram hosts and rebuilt into canonical URLs (no arbitrary fetching / SSRF). No logins, cookies or credentials are collected. The downloaders only target public content that users must have the right to download. Replace `hello@thul.example` with your real email and have the Privacy/Terms pages reviewed before going live.
