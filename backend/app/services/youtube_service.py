from .. import config
from ..utils.errors import ServiceError
from . import media_common as mc

STANDARD = [360, 480, 720, 1080]


def get_info(url: str) -> dict:
    info = mc.extract_info(url, "youtube")
    if info.get("is_live") or info.get("live_status") in ("is_live", "is_upcoming"):
        raise ServiceError("Live streams are not supported.", 422)
    duration = info.get("duration") or 0
    if duration > config.MAX_VIDEO_SECONDS:
        raise ServiceError(f"This video is longer than the {config.MAX_VIDEO_SECONDS // 60}-minute limit.", 422)
    heights = {f["height"] for f in info.get("formats", []) if f.get("vcodec") not in (None, "none") and f.get("height")}
    top = max(heights) if heights else 0
    qualities = [{"id": str(h), "label": f"{h}p (MP4)"} for h in STANDARD if h <= top or not heights]
    qualities += [{"id": "best", "label": f"Best available{f' ({top}p)' if top else ''}"},
                  {"id": "audio", "label": "Audio only (MP3)" if mc.ffmpeg_available() else "Audio only (M4A)"}]
    return {"id": info.get("id"), "title": info.get("title"), "thumbnail": info.get("thumbnail"),
            "duration": duration, "duration_text": mc.fmt_duration(duration), "uploader": info.get("uploader"),
            "qualities": qualities, "ffmpeg": mc.ffmpeg_available()}


def download(job, url: str, quality: str) -> None:
    ff = mc.ffmpeg_available()
    if quality == "audio":
        mc.download(job, url, "youtube", "bestaudio[ext=m4a]/bestaudio/best", audio=True)
        return
    if quality == "best":
        fmt = "bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b" if ff else "b[ext=mp4]/b"
    else:
        h = int(quality)
        fmt = (f"bv*[height<={h}][ext=mp4]+ba[ext=m4a]/bv*[height<={h}]+ba/b[height<={h}]" if ff
               else f"b[height<={h}][ext=mp4]/b[height<={h}]")
    mc.download(job, url, "youtube", fmt)
