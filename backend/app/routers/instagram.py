from fastapi import APIRouter, Depends

from ..services import instagram_service
from ..utils import jobs
from ..utils.security import rate_limit, validate_media_url
from .youtube import UrlBody

router = APIRouter(prefix="/api/instagram", tags=["instagram"])


@router.post("/info", dependencies=[Depends(rate_limit("ig-info", 20, 60))])
def info(body: UrlBody):
    return instagram_service.get_info(validate_media_url(body.url, "instagram"))


@router.post("/download", dependencies=[Depends(rate_limit("ig-dl", 6, 60))])
def download(body: UrlBody):
    url = validate_media_url(body.url, "instagram")
    job = jobs.submit(instagram_service.download, url)
    return {"job_id": job.id}
