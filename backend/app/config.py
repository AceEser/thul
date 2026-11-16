"""Central configuration. Values can be overridden in backend/.env"""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
TEMP_DIR = BASE_DIR / "temp"
for _d in (UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR):
    _d.mkdir(parents=True, exist_ok=True)

DB_PATH = BASE_DIR / "thul_feedback.db"

CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]

MB = 1024 * 1024
MAX_IMAGE_BYTES = _int("MAX_IMAGE_MB", 15) * MB
MAX_IMAGES_PER_REQUEST = 30
MAX_PDF_BYTES = _int("MAX_PDF_MB", 30) * MB
MAX_PDF_PAGES = 300
MAX_PIXELS = 100_000_000

FILE_TTL_MINUTES = _int("FILE_TTL_MINUTES", 20)
MAX_CONCURRENT_DOWNLOADS = _int("MAX_CONCURRENT_DOWNLOADS", 2)
MAX_QUEUED_DOWNLOADS = 10
MAX_DOWNLOAD_BYTES = _int("MAX_DOWNLOAD_MB", 1000) * MB
MAX_VIDEO_SECONDS = _int("MAX_VIDEO_MINUTES", 120) * 60

FFMPEG_LOCATION = os.getenv("FFMPEG_LOCATION") or None
