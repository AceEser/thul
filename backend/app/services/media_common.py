"""Shared yt-dlp / FFmpeg helpers used by the YouTube and Instagram services."""
import re
import shutil

import yt_dlp

from .. import config
from ..utils.errors import ServiceError
from ..utils.files import remove_dir
from ..utils.security import safe_filename

_ANSI = re.compile(r"\x1b\[[0-9;]*m")


def ffmpeg_available() -> bool:
    if config.FFMPEG_LOCATION:
        return True
    return shutil.which("ffmpeg") is not None


def friendly_error(raw: str, platform: str) -> str:
    msg = _ANSI.sub("", raw).lower()
    if any(k in msg for k in ("private", "login", "log in", "sign in", "cookies", "authentication")):
        return (f"This {platform} content is private, age/login restricted, or {platform} is blocking anonymous access. "
                "THUL only supports publicly available content and never asks for logins.")
    if any(k in msg for k in ("unavailable", "removed", "not available", "does not exist", "404")):
        return "This video is unavailable (it may be removed, private, or region-restricted)."
    if "no video" in msg or "there is no video" in msg:
        return "This post does not contain a downloadable video."
    if "copyright" in msg:
        return "This video is blocked for copyright reasons."
    if "429" in msg or "rate" in msg and "limit" in msg:
        return f"{platform.capitalize()} is rate-limiting requests right now. Please try again later."
    if "unsupported url" in msg:
        return "This link is not supported."
    return f"Could not fetch this {platform} media. It may be restricted, or the platform changed. Try updating yt-dlp."


def _base_opts() -> dict:
    opts = {"quiet": True, "no_warnings": True, "noplaylist": True, "socket_timeout": 20, "retries": 2,
            "restrictfilenames": True, "nocheckcertificate": False}
    if config.FFMPEG_LOCATION:
        opts["ffmpeg_location"] = config.FFMPEG_LOCATION
    return opts


def extract_info(url: str, platform: str) -> dict:
    opts = {**_base_opts(), "skip_download": True}
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            return ydl.sanitize_info(ydl.extract_info(url, download=False))
    except yt_dlp.utils.DownloadError as e:
        raise ServiceError(friendly_error(str(e), platform), 422)
    except Exception:
        raise ServiceError(f"Could not fetch information from {platform}.", 502)


def fmt_duration(seconds) -> str:
    if not seconds:
        return ""
    s = int(seconds)
    h, rem = divmod(s, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def download(job, url: str, platform: str, fmt: str, audio: bool = False) -> None:
    """Runs inside the worker pool. Updates job progress, writes the result into job.workdir."""
    workdir = config.TEMP_DIR / job.id
    workdir.mkdir(parents=True, exist_ok=True)
    job.workdir = workdir

    def hook(d):
        if d["status"] == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate")
            if total:
                job.update(progress=d["downloaded_bytes"] / total * 90, message="Downloading…")
        elif d["status"] == "finished":
            job.update(progress=92, message="Processing with FFmpeg…")

    opts = {**_base_opts(), "format": fmt, "outtmpl": str(workdir / "media.%(ext)s"),
            "progress_hooks": [hook], "max_filesize": config.MAX_DOWNLOAD_BYTES, "merge_output_format": "mp4"}
    if audio and ffmpeg_available():
        opts["postprocessors"] = [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}]
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except yt_dlp.utils.DownloadError as e:
        raise ServiceError(friendly_error(str(e), platform), 422)

    files = [p for p in workdir.iterdir() if p.is_file() and p.suffix not in (".part", ".ytdl", ".temp")]
    if not files:
        remove_dir(workdir)
        raise ServiceError("No file was produced. The video may exceed the size limit or be unavailable.", 422)
    f = max(files, key=lambda p: p.stat().st_size)
    title = safe_filename((info or {}).get("title") or "", default=f"thul-{platform}")
    job.finish(f, f"{title}{f.suffix}")
