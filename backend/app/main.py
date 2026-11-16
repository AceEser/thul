import asyncio
import importlib
import logging
import pkgutil
from contextlib import asynccontextmanager

import yt_dlp
from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import config, database, routers
from .services.media_common import ffmpeg_available
from .utils import jobs
from .utils.errors import ServiceError
from .utils.files import sweep_old
from .utils.security import prune_limiter, rate_limit

log = logging.getLogger("thul")
DIRS = (config.UPLOAD_DIR, config.OUTPUT_DIR, config.TEMP_DIR)


async def cleanup_loop():
    while True:
        await asyncio.sleep(300)
        try:
            for d in DIRS:
                sweep_old(d, config.FILE_TTL_MINUTES * 60)
            jobs.prune()
            prune_limiter()
        except Exception:
            log.exception("Cleanup failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    for d in DIRS:               # wipe anything left from a previous run
        sweep_old(d, 0)
    task = asyncio.create_task(cleanup_loop())
    yield
    task.cancel()


app = FastAPI(title="THUL API", version="1.0.0", lifespan=lifespan,
              dependencies=[Depends(rate_limit("global", 200, 60))])

app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["GET", "POST"],
                   allow_headers=["*"],
                   expose_headers=["Content-Disposition", "X-Original-Size", "X-Output-Size", "X-Width", "X-Height", "X-Pages"])


@app.exception_handler(ServiceError)
async def service_error_handler(_: Request, exc: ServiceError):
    return JSONResponse({"detail": exc.message}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    msgs = [e['msg'].replace('Value error, ', '') for e in exc.errors()]
    return JSONResponse({"detail": "; ".join(msgs) or "Invalid request."}, status_code=422)


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok", "ffmpeg": ffmpeg_available(), "yt_dlp": yt_dlp.version.__version__}


# Auto-register every module in app/routers/ that exposes `router` (files starting with "_" are skipped).
# To add a new backend tool, just drop a new file in that folder.
for _m in pkgutil.iter_modules(routers.__path__):
    if not _m.name.startswith("_"):
        _mod = importlib.import_module(f"{routers.__name__}.{_m.name}")
        if hasattr(_mod, "router"):
            app.include_router(_mod.router)
