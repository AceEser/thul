from ..utils.errors import ServiceError
from . import media_common as mc


def get_info(url: str) -> dict:
    info = mc.extract_info(url, "instagram")
    has_video = any(f.get("vcodec") not in (None, "none") for f in info.get("formats", [])) or info.get("url")
    if not has_video:
        raise ServiceError("This post does not contain a downloadable video.", 422)
    desc = (info.get("description") or "").strip()
    return {"id": info.get("id"), "title": info.get("title") or "Instagram video", "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"), "duration_text": mc.fmt_duration(info.get("duration")),
            "uploader": info.get("uploader") or info.get("channel"), "description": desc[:200]}


def download(job, url: str) -> None:
    fmt = "bv*+ba/b" if mc.ffmpeg_available() else "b[ext=mp4]/b"
    mc.download(job, url, "instagram", fmt)
