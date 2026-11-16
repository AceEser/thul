from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..services import youtube_service
from ..utils import jobs
from ..utils.security import rate_limit, validate_media_url

router = APIRouter(prefix="/api/youtube", tags=["youtube"])


class UrlBody(BaseModel):
    url: str = Field(max_length=500)


class DownloadBody(UrlBody):
    quality: Literal["360", "480", "720", "1080", "best", "audio"] = "best"


@router.post("/info", dependencies=[Depends(rate_limit("yt-info", 20, 60))])
def info(body: UrlBody):
    return youtube_service.get_info(validate_media_url(body.url, "youtube"))


@router.post("/download", dependencies=[Depends(rate_limit("yt-dl", 6, 60))])
def download(body: DownloadBody):
    url = validate_media_url(body.url, "youtube")
    job = jobs.submit(youtube_service.download, url, body.quality)
    return {"job_id": job.id}
