import io
from typing import NamedTuple

from PIL import Image, ImageOps

from .. import config
from ..utils.errors import ServiceError

Image.MAX_IMAGE_PIXELS = config.MAX_PIXELS

# key -> (Pillow format, extension, mime)
FORMATS = {
    "jpg": ("JPEG", "jpg", "image/jpeg"),
    "png": ("PNG", "png", "image/png"),
    "webp": ("WEBP", "webp", "image/webp"),
    "bmp": ("BMP", "bmp", "image/bmp"),
    "tiff": ("TIFF", "tiff", "image/tiff"),
}
_FROM_PIL = {v[0]: k for k, v in FORMATS.items()}


class ImageResult(NamedTuple):
    data: bytes
    width: int
    height: int
    key: str


def open_image(data: bytes):
    """Verify the real file content (not just the extension) and return (image, format key)."""
    try:
        probe = Image.open(io.BytesIO(data))
        fmt = probe.format
        probe.verify()
    except Exception:
        raise ServiceError("This file is not a valid image (or it is too large to process).", 422)
    if fmt not in _FROM_PIL:
        raise ServiceError("Unsupported image format. Use JPG, PNG, WEBP, BMP or TIFF.", 415)
    try:
        img = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
        img.load()
    except Exception:
        raise ServiceError("Could not read this image.", 422)
    if img.mode == "P" or img.mode == "PA":
        img = img.convert("RGBA")
    elif img.mode not in ("1", "L", "LA", "RGB", "RGBA"):
        img = img.convert("RGB")
    return img, _FROM_PIL[fmt]


def flatten(img: Image.Image) -> Image.Image:
    """Remove transparency (white background) for formats without alpha."""
    if img.mode in ("RGBA", "LA"):
        rgba = img.convert("RGBA")
        bg = Image.new("RGB", rgba.size, (255, 255, 255))
        bg.paste(rgba, mask=rgba.split()[3])
        return bg
    return img.convert("RGB")


def encode(img: Image.Image, key: str, quality: int) -> bytes:
    fmt = FORMATS[key][0]
    params = {}
    if fmt == "JPEG":
        img, params = flatten(img), dict(quality=quality, optimize=True, progressive=True, subsampling=0 if quality >= 90 else 2)
    elif fmt == "WEBP":
        params = dict(quality=quality, method=6)
    elif fmt == "PNG":
        params = dict(optimize=True)
    elif fmt == "BMP":
        img = flatten(img)
    elif fmt == "TIFF":
        params = dict(compression="tiff_lzw")
    buf = io.BytesIO()
    img.save(buf, fmt, **params)
    return buf.getvalue()


def convert(data: bytes, key: str, quality: int) -> ImageResult:
    img, _ = open_image(data)
    return ImageResult(encode(img, key, quality), img.width, img.height, key)


def resize(data: bytes, width, height, percent, quality: int, out: str) -> ImageResult:
    img, src_key = open_image(data)
    w0, h0 = img.size
    if percent:
        w, h = max(1, round(w0 * percent / 100)), max(1, round(h0 * percent / 100))
    elif width and height:
        w, h = width, height
    elif width:
        w, h = width, max(1, round(h0 * width / w0))
    elif height:
        w, h = max(1, round(w0 * height / h0)), height
    else:
        w, h = w0, h0
    if w * h > config.MAX_PIXELS // 4:
        raise ServiceError("The requested output size is too large.", 422)
    if (w, h) != (w0, h0):
        img = img.resize((w, h), Image.Resampling.LANCZOS)
    key = src_key if out == "original" else out
    return ImageResult(encode(img, key, quality), w, h, key)
