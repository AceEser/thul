from typing import Literal, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.concurrency import run_in_threadpool

from .. import config
from ..services import image_service, pdf_service
from ..utils.errors import ServiceError
from ..utils.files import file_response, new_workdir, remove_dir
from ..utils.security import rate_limit, read_upload, safe_filename
from pathlib import Path

router = APIRouter(prefix="/api", tags=["image"])
limit = Depends(rate_limit("image", 30, 60))

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
IMG_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp", "image/x-ms-bmp", "image/x-bmp",
            "image/tiff", "image/x-tiff"}
FormatKey = Literal["jpg", "png", "webp", "bmp", "tiff"]


def _respond(result: image_service.ImageResult, original_name: str, original_size: int, suffix: str = ""):
    _, ext, mime = image_service.FORMATS[result.key]
    workdir = new_workdir(config.OUTPUT_DIR)
    name = f"{safe_filename(Path(original_name or 'image').stem, 'image')}{suffix}.{ext}"
    path = workdir / f"out.{ext}"
    path.write_bytes(result.data)
    headers = {"X-Original-Size": str(original_size), "X-Output-Size": str(len(result.data)),
               "X-Width": str(result.width), "X-Height": str(result.height)}
    return file_response(path, name, mime, workdir, headers)


@router.post("/image-to-pdf", dependencies=[limit])
async def image_to_pdf(files: list[UploadFile] = File(...)):
    if not files or len(files) > config.MAX_IMAGES_PER_REQUEST:
        raise ServiceError(f"Upload between 1 and {config.MAX_IMAGES_PER_REQUEST} images.", 400)
    datas, total = [], 0
    for f in files:
        d = await read_upload(f, max_bytes=config.MAX_IMAGE_BYTES, extensions=IMG_EXT, mimes=IMG_MIME)
        total += len(d)
        if total > config.MAX_IMAGE_BYTES * 6:
            raise ServiceError("The combined size of the images is too large.", 413)
        datas.append(d)
    workdir = new_workdir(config.OUTPUT_DIR)
    try:
        pdf = await run_in_threadpool(pdf_service.images_to_pdf, datas)
        path = workdir / "images.pdf"
        path.write_bytes(pdf)
    except BaseException:
        remove_dir(workdir)
        raise
    return file_response(path, "thul-images.pdf", "application/pdf", workdir)


@router.post("/image-convert", dependencies=[limit])
async def image_convert(file: UploadFile = File(...), output_format: FormatKey = Form(...),
                        quality: int = Form(90, ge=1, le=100)):
    data = await read_upload(file, max_bytes=config.MAX_IMAGE_BYTES, extensions=IMG_EXT, mimes=IMG_MIME)
    result = await run_in_threadpool(image_service.convert, data, output_format, quality)
    return _respond(result, file.filename, len(data), "-thul")


@router.post("/image-resize", dependencies=[limit])
async def image_resize(file: UploadFile = File(...),
                       width: Optional[int] = Form(None, ge=1, le=10000),
                       height: Optional[int] = Form(None, ge=1, le=10000),
                       percent: Optional[int] = Form(None, ge=1, le=500),
                       quality: int = Form(85, ge=1, le=100),
                       output_format: Literal["original", "jpg", "png", "webp"] = Form("original")):
    data = await read_upload(file, max_bytes=config.MAX_IMAGE_BYTES, extensions=IMG_EXT, mimes=IMG_MIME)
    result = await run_in_threadpool(image_service.resize, data, width, height, percent, quality, output_format)
    return _respond(result, file.filename, len(data), "-resized")
