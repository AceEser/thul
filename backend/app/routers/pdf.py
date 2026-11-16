from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.concurrency import run_in_threadpool

from .. import config
from ..services import pdf_service
from ..utils.errors import ServiceError
from ..utils.files import file_response, new_workdir, remove_dir
from ..utils.security import rate_limit, read_upload, safe_filename

router = APIRouter(prefix="/api", tags=["pdf"])
DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@router.post("/pdf-to-word", dependencies=[Depends(rate_limit("pdf", 15, 60))])
async def pdf_to_word(file: UploadFile = File(...)):
    data = await read_upload(file, max_bytes=config.MAX_PDF_BYTES, extensions={".pdf"},
                             mimes={"application/pdf", "application/x-pdf"})
    if not data.startswith(b"%PDF"):
        raise ServiceError("This file is not a valid PDF.", 422)
    workdir = new_workdir(config.UPLOAD_DIR)
    try:
        src, dst = workdir / "input.pdf", workdir / "output.docx"
        src.write_bytes(data)
        stats = await run_in_threadpool(pdf_service.pdf_to_docx, str(src), str(dst))
        src.unlink(missing_ok=True)
    except BaseException:
        remove_dir(workdir)
        raise
    name = safe_filename(Path(file.filename or "document").stem, "document") + ".docx"
    return file_response(dst, name, DOCX, workdir, {"X-Pages": str(stats["pages"])})
