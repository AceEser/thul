import mimetypes

from fastapi import APIRouter
from fastapi.responses import FileResponse

from ..utils import jobs
from ..utils.errors import ServiceError

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/{job_id}")
def status(job_id: str):
    return jobs.get(job_id).to_dict()


@router.get("/{job_id}/file")
def file(job_id: str):
    job = jobs.get(job_id)
    if job.status != "finished" or not job.filepath or not job.filepath.exists():
        raise ServiceError("The file is not ready (or has expired).", 409)
    mime = mimetypes.guess_type(job.filename)[0] or "application/octet-stream"
    # Streamed from disk in chunks; the folder is removed automatically after FILE_TTL_MINUTES.
    return FileResponse(job.filepath, media_type=mime, filename=job.filename)
