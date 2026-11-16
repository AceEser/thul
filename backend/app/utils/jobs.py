"""Background jobs with progress, a bounded worker pool and automatic expiry."""
import logging
import re
import time
import uuid
from concurrent.futures import ThreadPoolExecutor

from .. import config
from .errors import ServiceError
from .files import remove_dir

log = logging.getLogger("thul.jobs")
JOBS: dict[str, "Job"] = {}
_pool = ThreadPoolExecutor(max_workers=config.MAX_CONCURRENT_DOWNLOADS)
_ID = re.compile(r"^[a-f0-9]{32}$")


class Job:
    def __init__(self):
        self.id = uuid.uuid4().hex
        self.status = "queued"          # queued | processing | finished | error
        self.progress = 0
        self.message = "Waiting in queue…"
        self.error = None
        self.created = time.time()
        self.workdir = None
        self.filepath = None
        self.filename = None

    def update(self, progress=None, message=None):
        if progress is not None:
            self.progress = max(self.progress, min(99, int(progress)))
        if message:
            self.message = message

    def finish(self, path, filename):
        self.filepath, self.filename = path, filename
        self.progress, self.status, self.message = 100, "finished", "Ready to download"

    def fail(self, message):
        self.status, self.error, self.message = "error", message, message

    def to_dict(self):
        size = self.filepath.stat().st_size if self.filepath and self.filepath.exists() else None
        return {"id": self.id, "status": self.status, "progress": self.progress, "message": self.message,
                "error": self.error, "filename": self.filename, "size": size}


def submit(fn, *args) -> Job:
    active = sum(1 for j in JOBS.values() if j.status in ("queued", "processing"))
    if active >= config.MAX_CONCURRENT_DOWNLOADS + config.MAX_QUEUED_DOWNLOADS:
        raise ServiceError("The server is busy right now. Please try again in a minute.", 503)
    job = Job()
    JOBS[job.id] = job

    def runner():
        job.status, job.message = "processing", "Starting…"
        try:
            fn(job, *args)
        except ServiceError as e:
            job.fail(e.message)
            remove_dir(job.workdir)
        except Exception:
            log.exception("Job failed")
            job.fail("Something went wrong while processing. Please try again.")
            remove_dir(job.workdir)

    _pool.submit(runner)
    return job


def get(job_id: str) -> Job:
    job = JOBS.get(job_id) if _ID.match(job_id or "") else None
    if not job:
        raise ServiceError("Job not found or expired.", 404)
    return job


def prune():
    cutoff = time.time() - config.FILE_TTL_MINUTES * 60
    for job in [j for j in JOBS.values() if j.created < cutoff and j.status in ("finished", "error")]:
        remove_dir(job.workdir)
        JOBS.pop(job.id, None)
