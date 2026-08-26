"""PDF/image conversion helpers (PyMuPDF + Pillow)."""

from __future__ import annotations

import io
import logging
from pathlib import Path

import fitz
from PIL import Image

from app.config import settings

logger = logging.getLogger(__name__)

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp"}
PDF_EXTENSIONS = {".pdf"}
LLM_MAX_EDGE = 1600


class ConversionError(ValueError):
    pass


def session_dir(session_id: str, kind: str) -> Path:
    path = settings.STORAGE_ROOT / session_id / kind
    path.mkdir(parents=True, exist_ok=True)
    return path


def clear_dir(path: Path) -> None:
    if not path.exists():
        return
    for child in path.iterdir():
        if child.is_file():
            child.unlink()


def _save_png(image: Image.Image, dest: Path) -> Path:
    rgb = image.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(dest, format="PNG")
    return dest


def pdf_bytes_to_pngs(
    data: bytes,
    output_dir: Path,
    start_index: int,
    dpi: int | None = None,
) -> list[Path]:
    dpi = dpi or settings.PDF_DPI
    try:
        document = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:  # noqa: BLE001
        raise ConversionError(f"Unable to open PDF: {exc}") from exc

    if document.is_encrypted:
        document.close()
        raise ConversionError("Encrypted PDFs are not supported")

    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)
    saved: list[Path] = []
    try:
        for offset, page in enumerate(document):
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            dest = output_dir / f"page_{start_index + offset}.png"
            pixmap.save(str(dest))
            saved.append(dest)
    finally:
        document.close()
    return saved


def image_bytes_to_png(data: bytes, dest: Path) -> Path:
    try:
        image = Image.open(io.BytesIO(data))
        image.load()
    except Exception as exc:  # noqa: BLE001
        raise ConversionError(f"Unable to open image: {exc}") from exc
    return _save_png(image, dest)


def convert_upload_to_pages(
    data: bytes,
    filename: str,
    output_dir: Path,
    start_index: int,
) -> list[Path]:
    suffix = Path(filename or "").suffix.lower()
    if suffix in PDF_EXTENSIONS or data[:4] == b"%PDF":
        return pdf_bytes_to_pngs(data, output_dir, start_index)
    if suffix in IMAGE_EXTENSIONS or suffix == "":
        dest = output_dir / f"page_{start_index}.png"
        return [image_bytes_to_png(data, dest)]
    raise ConversionError(f"Unsupported file type: {suffix or filename}")


def read_bytes(path: str | Path) -> bytes:
    return Path(path).read_bytes()


def downscale_for_llm(image_bytes: bytes, max_edge: int = LLM_MAX_EDGE) -> bytes:
    """Shrink a copy for the LLM. Normalized bboxes still match the stored original."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = image.size
    longest = max(width, height)
    if longest <= max_edge:
        return image_bytes
    scale = max_edge / float(longest)
    resized = image.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    resized.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def crop_normalized(image_bytes: bytes, x: float, y: float, width: float, height: float) -> bytes:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_w, img_h = image.size
    left = int(x * img_w)
    top = int(y * img_h)
    right = int((x + width) * img_w)
    bottom = int((y + height) * img_h)
    left, top = max(0, left), max(0, top)
    right, bottom = min(img_w, max(left + 1, right)), min(img_h, max(top + 1, bottom))
    cropped = image.crop((left, top, right, bottom))
    buffer = io.BytesIO()
    cropped.save(buffer, format="PNG")
    return buffer.getvalue()
