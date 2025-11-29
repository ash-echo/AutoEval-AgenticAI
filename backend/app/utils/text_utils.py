"""
Text utilities for cleaning and processing OCR output.
"""

import re
import logging

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """
    Clean OCR text: remove extra spaces, fix common OCR errors.
    """
    try:
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove leading/trailing spaces per line
        lines = [line.strip() for line in text.split('\n')]
        text = '\n'.join(lines)
        # Remove empty lines
        lines = [line for line in lines if line]
        text = '\n'.join(lines)
        return text
    except Exception as e:
        logger.error(f"Text cleaning failed: {e}")
        return text