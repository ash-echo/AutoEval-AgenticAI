"""
Parser Agent: Extract and structure question data from teacher-uploaded files

Parses PDF/DOCX question keys to extract questions, ideal answers, and marks.
"""

import re
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

try:
    import pdfplumber
except ImportError:
    logger.warning("pdfplumber not installed. PDF parsing disabled.")
    pdfplumber = None

try:
    from docx import Document
except ImportError:
    logger.warning("python-docx not installed. DOCX parsing disabled.")
    Document = None

def parse_question_key(file_path: str) -> Dict[str, Any]:
    """
    Parse question key file (PDF or DOCX) to extract structured question data.
    Returns dict with question numbers as keys.
    """
    try:
        file_ext = Path(file_path).suffix.lower()

        if file_ext == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif file_ext == '.docx':
            text = extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        return parse_question_text(text)

    except Exception as e:
        logger.error(f"Question key parsing failed for {file_path}: {e}")
        return {"subject": "general", "questions": {}}

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using pdfplumber."""
    if not pdfplumber:
        raise ImportError("pdfplumber required for PDF parsing")

    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(docx_path: str) -> str:
    """Extract text from DOCX using python-docx."""
    if not Document:
        raise ImportError("python-docx required for DOCX parsing")

    doc = Document(docx_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def parse_question_text(text: str) -> Dict[str, Any]:
    """
    Parse the extracted text to identify questions, answers, and marks.
    """
    questions = {}
    lines = text.split('\n')
    current_question = None
    current_data = {}
    subject = "general"  # default

    # Try to detect subject from text
    text_lower = text.lower()
    if "math" in text_lower or "mathematics" in text_lower:
        subject = "Mathematics"
    elif "physics" in text_lower:
        subject = "Physics"
    elif "chemistry" in text_lower:
        subject = "Chemistry"
    elif "science" in text_lower:
        subject = "Science"
    elif "english" in text_lower or "literature" in text_lower:
        subject = "English"

    question_pattern = re.compile(r'^(?:Q(?:uestion)?\s*)?(\d+)\.?\s*(.*)$', re.IGNORECASE)
    marks_pattern = re.compile(r'(\d+)\s*marks?', re.IGNORECASE)

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for question start
        match = question_pattern.match(line)
        if match:
            # Save previous question
            if current_question and current_data:
                questions[current_question] = current_data

            # Start new question
            current_question = f"Q{match.group(1)}"
            current_data = {
                "question": match.group(2).strip(),
                "ideal_answer": "",
                "marks": 1  # default
            }
        elif current_question:
            # Check for marks
            marks_match = marks_pattern.search(line)
            if marks_match:
                current_data["marks"] = int(marks_match.group(1))
            else:
                # Accumulate answer text
                if current_data["ideal_answer"]:
                    current_data["ideal_answer"] += " " + line
                else:
                    current_data["ideal_answer"] = line

    # Save last question
    if current_question and current_data:
        questions[current_question] = current_data

    logger.info(f"Parsed subject: {subject}, {len(questions)} questions from question key")
    return {"subject": subject, "questions": questions}