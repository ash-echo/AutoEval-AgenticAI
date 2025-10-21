"""
File utilities for handling PDFs and images.
"""

import logging
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)

try:
    from pdf2image import convert_from_path
except ImportError:
    logger.warning("pdf2image not installed. PDF processing disabled.")
    convert_from_path = None

def extract_images_from_pdf(pdf_path: str) -> List[str]:
    """
    Extract images from PDF and save as PNG files.
    Returns list of image paths.
    """
    if not convert_from_path:
        raise ImportError("pdf2image required for PDF processing")

    try:
        images = convert_from_path(pdf_path)
        image_paths = []
        pdf_name = Path(pdf_path).stem

        for i, image in enumerate(images):
            image_path = f"{pdf_name}_page_{i+1}.png"
            image.save(image_path, "PNG")
            image_paths.append(image_path)

        logger.info(f"Extracted {len(image_paths)} images from {pdf_path}")
        return image_paths

    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return []