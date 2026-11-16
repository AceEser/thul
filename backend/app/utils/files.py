import shutil
import time
import uuid
from pathlib import Path

from fastapi.responses import FileResponse
from starlette.background import BackgroundTask


def new_workdir(base: Path) -> Path:
    d = base / uuid.uuid4().hex
    d.mkdir(parents=True)
    return d


def remove_dir(path) -> None:
    if path:
        shutil.rmtree(path, ignore_errors=True)


def file_response(path: Path, filename: str, media_type: str, workdir: Path, headers: dict | None = None):
    """Stream a file from disk, then delete its working folder."""
    return FileResponse(path, media_type=media_type, filename=filename, headers=headers,
                        background=BackgroundTask(remove_dir, workdir))


def sweep_old(base: Path, ttl_seconds: int) -> None:
    """Delete anything in `base` older than ttl_seconds (0 = everything)."""
    now = time.time()
    for entry in base.iterdir():
        if entry.name == ".gitkeep":
            continue
        try:
            if now - entry.stat().st_mtime >= ttl_seconds:
                shutil.rmtree(entry, ignore_errors=True) if entry.is_dir() else entry.unlink(missing_ok=True)
        except OSError:
            pass
