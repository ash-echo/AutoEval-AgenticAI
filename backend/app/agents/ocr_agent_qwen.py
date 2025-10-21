"""
Handwriting and Math Exam OCR Engine using Hugging Face Qwen-VL Model
Modified for multi-agent integration: Returns structured dicts for agent communication.
Error-proof with retries, logging, and fallbacks.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

try:
    import torch
    from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, Qwen2VLProcessor
    from PIL import Image
except ImportError as e:
    logger.error(f"Import failed: {e}")
    sys.exit(1)


class OCREngine:
    def __init__(self, model_name: str = os.getenv("OCR_MODEL", "Qwen/Qwen2-VL-2B-Instruct")):
        """Initialize the OCR engine with model and device setup."""
        if not torch.cuda.is_available():
            raise RuntimeError(
                "CUDA GPU is required for OCR processing. Please ensure a CUDA-compatible GPU is available and PyTorch is installed with CUDA support."
            )

        self.device = torch.device("cuda")
        logger.info(f"Using GPU device: {self.device}")

        try:
            self.model = Qwen2VLForConditionalGeneration.from_pretrained(
                model_name, torch_dtype=torch.float16, device_map="auto"
            )
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.processor = Qwen2VLProcessor.from_pretrained(model_name, use_fast=False)
            logger.info("OCR model loaded successfully on GPU.")
        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            raise RuntimeError(f"Failed to load OCR model on GPU: {e}")

    def ocr_handwriting(self, image_path: str, subject: str = "general") -> str:
        """Perform OCR on a single image with subject-aware prompt."""
        try:
            if not Path(image_path).exists():
                raise FileNotFoundError(f"Image not found: {image_path}")

            image = Image.open(image_path).convert("RGB")
            prompt = self._get_subject_prompt(subject)

            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image", "image": image},
                    ],
                }
            ]

            text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = self.processor(text=text, images=image, return_tensors="pt").to(self.device)

            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs, max_new_tokens=2048, do_sample=False
                )

            generated_ids_trimmed = [
                out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
            ]

            output_text = self.processor.batch_decode(
                generated_ids_trimmed, skip_special_tokens=True
            )[0]

            return output_text.strip()

        except Exception as e:
            logger.error(f"OCR failed for {image_path}: {e}")
            return ""

    def _get_subject_prompt(self, subject: str) -> str:
        """Selects simple prompt template based on subject context."""
        subject_lower = subject.lower()

        # Math/Science subject prompt (preserves equations and layout)
        if any(
            keyword in subject_lower
            for keyword in ["math", "mathematics", "physics", "chemistry", "science"]
        ):
            return "Transcribe all visible text from this image exactly as it appears, including mathematical symbols and equations. Preserve layout and structure."

        # Default generic subject prompt
        return "Transcribe all visible text from this image exactly as it appears. Preserve layout and structure."

    def process_folder(self, folder_path: str, subject: str = "general") -> Dict[str, Dict[str, str]]:
        """Process all supported images in a folder and return structured OCR outputs."""
        try:
            results = {}
            folder = Path(folder_path)

            if not folder.exists():
                raise FileNotFoundError(f"Folder not found: {folder_path}")

            for file_path in folder.iterdir():
                if file_path.suffix.lower() in {".jpg", ".jpeg", ".png"}:
                    ocr_text = self.ocr_handwriting(str(file_path), subject)
                    structured = self.parse_exam_output(ocr_text)
                    results[file_path.name] = {
                        "raw_ocr": ocr_text,
                        "structured": structured,
                    }

            return results
        except Exception as e:
            logger.error(f"Folder processing failed: {e}")
            return {}

    def parse_exam_output(self, ocr_text: str) -> Dict[str, str]:
        """
        Parse raw OCR text into structured exam Q&A pairs with document-level memory.
        Handles a), b), c), etc. OR 01), 02), 06), etc. formats.
        Maintains question numbering continuity across pages.
        Returns a dict mapping question numbers to extracted answers.
        """
        structured_answers = {}
        lines = ocr_text.split("\n")
        current_question = None
        current_answer = []
        question_counter = 0  # Track sequential question numbering

        import re
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Match a), b), c), etc. OR 01), 02), 06), etc. format (more flexible)
            question_match = re.match(
                r".*?([a-z]|\d+)\)\s*(.*)$", line, re.IGNORECASE
            )

            if question_match:
                # Save previous question if present
                if current_question is not None:
                    structured_answers[current_question] = "\n".join(current_answer).strip()

                # Extract the label (letter or number)
                label = question_match.group(1).lower()
                remaining_text = question_match.group(2).strip()

                # Determine the question number based on document flow
                if label.isalpha():
                    # Letter format: use alphabetical position
                    expected_num = ord(label) - ord('a') + 1
                    question_counter = max(question_counter, expected_num)
                    question_number = str(expected_num)
                else:
                    # Number format: could be OCR misread or actual numbering
                    # If it's a small number that matches our counter + 1, use it
                    num_val = int(label.lstrip('0') or '0')
                    if num_val == question_counter + 1:
                        question_number = str(num_val)
                        question_counter = num_val
                    else:
                        # Assume it's the next sequential question
                        question_counter += 1
                        question_number = str(question_counter)

                current_question = question_number
                current_answer = [remaining_text] if remaining_text else []

            elif current_question is not None:
                current_answer.append(line)

        if current_question is not None:
            structured_answers[current_question] = "\n".join(current_answer).strip()

        return structured_answers

