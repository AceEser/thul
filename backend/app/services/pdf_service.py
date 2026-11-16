import io
import re

import pymupdf  # PyMuPDF
import img2pdf
from docx import Document
from docx.shared import Pt, RGBColor
from PIL import Image

from .. import config
from ..utils.errors import ServiceError
from .image_service import flatten, open_image

_XML_BAD = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def images_to_pdf(files: list[bytes]) -> bytes:
    pages = []
    for data in files:
        img, _ = open_image(data)
        buf = io.BytesIO()
        flatten(img).save(buf, "JPEG", quality=95, optimize=True)
        pages.append(buf.getvalue())
    try:
        return img2pdf.convert(pages)
    except Exception:
        raise ServiceError("Could not create the PDF from these images.", 422)


def pdf_to_docx(src, dst) -> dict:
    try:
        doc = pymupdf.open(src)
    except Exception:
        raise ServiceError("This file could not be opened as a PDF.", 422)
    with doc:
        if doc.needs_pass:
            raise ServiceError("Password-protected PDFs are not supported.", 422)
        if doc.page_count > config.MAX_PDF_PAGES:
            raise ServiceError(f"PDF has too many pages (limit {config.MAX_PDF_PAGES}).", 413)
        out, chars = Document(), 0
        for pno, page in enumerate(doc):
            for block in page.get_text("dict")["blocks"]:
                if block.get("type") != 0:
                    continue
                para = out.add_paragraph()
                lines = block["lines"]
                for li, line in enumerate(lines):
                    for span in line["spans"]:
                        text = _XML_BAD.sub("", span["text"])
                        if not text:
                            continue
                        run = para.add_run(text)
                        run.font.size = Pt(max(6, min(round(span["size"] * 2) / 2, 48)))
                        run.bold = bool(span["flags"] & 16)
                        run.italic = bool(span["flags"] & 2)
                        c = span["color"]
                        if c:
                            run.font.color.rgb = RGBColor((c >> 16) & 255, (c >> 8) & 255, c & 255)
                        chars += len(text.strip())
                    if li < len(lines) - 1:
                        para.add_run(" ")
                if not para.text.strip():
                    para._element.getparent().remove(para._element)
            if pno < doc.page_count - 1:
                out.add_page_break()
        pages = doc.page_count
    if chars < 20:
        raise ServiceError("No selectable text was found. This looks like a scanned PDF, which needs OCR "
                           "(not included in THUL).", 422)
    out.save(dst)
    return {"pages": pages, "characters": chars}
