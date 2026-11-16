"""Rate limiting, upload validation, URL allow-listing and filename sanitising."""
import re
import threading
import time
from collections import defaultdict, deque
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException, Request, UploadFile

from .errors import ServiceError


class _Limiter:
    def __init__(self):
        self.hits = defaultdict(deque)
        self.lock = threading.Lock()

    def check(self, key: str, limit: int, window: int) -> bool:
        now = time.monotonic()
        with self.lock:
            q = self.hits[key]
            while q and now - q[0] > window:
                q.popleft()
            if len(q) >= limit:
                return False
            q.append(now)
            return True

    def prune(self, max_age: int = 3700):
        now = time.monotonic()
        with self.lock:
            for k in [k for k, q in self.hits.items() if not q or now - q[-1] > max_age]:
                del self.hits[k]


_limiter = _Limiter()
prune_limiter = _limiter.prune


def rate_limit(name: str, limit: int, window: int = 60):
    """FastAPI dependency: `dependencies=[Depends(rate_limit("x", 10, 60))]`"""
    async def dep(request: Request):
        ip = request.client.host if request.client else "unknown"
        if not _limiter.check(f"{name}:{ip}", limit, window):
            raise HTTPException(429, "Too many requests. Please wait a moment and try again.")
    return dep


async def read_upload(file: UploadFile, *, max_bytes: int, extensions: set, mimes: set | None = None) -> bytes:
    name = file.filename or "file"
    ext = Path(name).suffix.lower()
    if ext not in extensions:
        raise ServiceError(f"Unsupported file type '{ext or 'unknown'}'. Allowed: {', '.join(sorted(extensions))}", 415)
    ctype = (file.content_type or "").lower()
    if mimes and ctype not in mimes and ctype not in ("", "application/octet-stream"):
        raise ServiceError(f"Unsupported content type for '{name}'.", 415)
    chunks, size = [], 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > max_bytes:
            raise ServiceError(f"'{name}' is larger than the {max_bytes // (1024 * 1024)} MB limit.", 413)
        chunks.append(chunk)
    if size == 0:
        raise ServiceError(f"'{name}' is empty.", 400)
    return b"".join(chunks)


def safe_filename(name: str, default: str = "thul-file", max_len: int = 80) -> str:
    name = re.sub(r"[^\w\s.\-]", "", name or "", flags=re.UNICODE)
    name = re.sub(r"\s+", " ", name).strip(" .")
    return name[:max_len].strip(" .") or default


_HOSTS = {
    "youtube": {"youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"},
    "instagram": {"instagram.com", "www.instagram.com"},
}
_NAMES = {"youtube": "YouTube", "instagram": "Instagram"}
_YT_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
_IG_PATH = re.compile(r"^/(?:[A-Za-z0-9_.]+/)?(reels?|p|tv)/([A-Za-z0-9_-]{5,20})/?$")


def validate_media_url(raw: str, platform: str) -> str:
    """Strict allow-list. Returns a *canonical* URL rebuilt from parsed parts (SSRF-safe)."""
    raw = (raw or "").strip()
    if not raw or len(raw) > 500:
        raise ServiceError("Please paste a valid URL.", 400)
    if not raw.lower().startswith(("http://", "https://")):
        raw = "https://" + raw
    try:
        p = urlparse(raw)
        host, port = p.hostname, p.port
    except ValueError:
        raise ServiceError("That does not look like a valid URL.", 400)
    if host not in _HOSTS[platform] or p.username or p.password or port not in (None, 80, 443):
        raise ServiceError(f"Only {_NAMES[platform]} links are supported here.", 400)

    if platform == "youtube":
        vid = None
        if host == "youtu.be":
            vid = p.path.strip("/").split("/")[0]
        elif p.path == "/watch":
            vid = (parse_qs(p.query).get("v") or [""])[0]
        else:
            m = re.match(r"^/(shorts|embed|live)/([^/]+)", p.path)
            vid = m.group(2) if m else None
        if not vid or not _YT_ID.match(vid):
            raise ServiceError("Please paste a link to a single YouTube video.", 400)
        return f"https://www.youtube.com/watch?v={vid}"

    m = _IG_PATH.match(p.path)
    if not m:
        raise ServiceError("Please paste a link to an Instagram video or Reel (…/reel/… or …/p/…).", 400)
    kind = "reel" if m.group(1).startswith("reel") else m.group(1)
    return f"https://www.instagram.com/{kind}/{m.group(2)}/"
