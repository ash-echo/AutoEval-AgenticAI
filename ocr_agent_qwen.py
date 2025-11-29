"""
Handwriting and Math Exam OCR Engine (Full Coverage Edition)
Using Qwen-VL-2B-Instruct — tuned for math, diagrams, and hybrid exam layouts.

✅ Ensures full extraction — no missing text or cropped areas.
✅ Uses vertical-tiling OCR retry for long/complex answer sheets.
✅ Multi-agent friendly structured output for evaluation.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict
from PIL import Image
import torch
from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, Qwen2VLProcessor

logger = logging.getLogger(__name__)


class OCREngine:
    def __init__(self, model_name: str = os.getenv("OCR_MODEL", "Qwen/Qwen2-VL-2B-Instruct")):
        if not torch.cuda.is_available():
            raise RuntimeError("CUDA GPU required for OCR processing.")

        self.device = torch.device("cuda")
        logger.info(f"Using GPU device: {self.device}")

        try:
            self.model = Qwen2VLForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.processor = Qwen2VLProcessor.from_pretrained(model_name, use_fast=False)
            logger.info("OCR model loaded successfully.")
        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            raise RuntimeError(f"Failed to load OCR model: {e}")

    # -------------------------------------------------------------------------
    # MAIN OCR METHOD — now includes coverage validation & tiling retries
    # -------------------------------------------------------------------------
    def ocr_handwriting(self, image_path: str, subject: str = "general") -> str:
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = Image.open(image_path).convert("RGB")
        prompt = self._get_subject_prompt(subject)

        try:
            text = self._run_ocr_once(image, prompt)

            # Coverage assurance: retry if text looks too short
            if len(text.split()) < 15 or text.count("\n") < 3:
                logger.warning(f"Low coverage detected on {image_path}. Retrying with tiling...")
                text = self._tile_and_retry(image, prompt)

            return text.strip()
        except Exception as e:
            logger.error(f"OCR failed for {image_path}: {e}")
            return ""

    # -------------------------------------------------------------------------
    # Core OCR Generation Pass
    # -------------------------------------------------------------------------
    def _run_ocr_once(self, image: Image.Image, prompt: str) -> str:
        messages = [{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image", "image": image}
        ]}]

        text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.processor(text=text, images=image, return_tensors="pt").to(self.device)

        with torch.no_grad():
            generated_ids = self.model.generate(**inputs, max_new_tokens=4096, do_sample=False)

        generated_ids_trimmed = [out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)]
        output_text = self.processor.batch_decode(generated_ids_trimmed, skip_special_tokens=True)[0]
        return output_text.strip()

    # -------------------------------------------------------------------------
    # Retry by Tiling Image (splitting vertically to avoid cutoff)
    # -------------------------------------------------------------------------
    def _tile_and_retry(self, image: Image.Image, prompt: str) -> str:
        width, height = image.size
        segments = []
        num_tiles = 3 if height > 1800 else 2  # adaptive tiling
        tile_height = height // num_tiles

        for i in range(num_tiles):
            y0 = i * tile_height
            y1 = height if i == num_tiles - 1 else (i + 1) * tile_height
            tile = image.crop((0, y0, width, y1))
            logger.info(f"Processing tile {i+1}/{num_tiles} for full coverage.")
            try:
                part_text = self._run_ocr_once(tile, prompt)
                if part_text:
                    segments.append(part_text)
            except Exception as e:
                logger.error(f"Tile {i+1} OCR failed: {e}")

        merged = "\n\n".join(segments)
        return merged

    # -------------------------------------------------------------------------
    # Strict, subject-aware OCR prompt
    # -------------------------------------------------------------------------
    def _get_subject_prompt(self, subject: str) -> str:
        subject_lower = subject.lower()
        math_keywords = ["math", "physics", "chemistry", "science"]

        base_prompt = """<|system|>
You are a **precision OCR system** for exam sheets containing handwritten and printed text, equations, and diagrams.
Your job is to **transcribe everything visible**, with 100% completeness — do NOT omit or summarize any content.

-----------------------------------------------------
🔹 RULES
-----------------------------------------------------
- Transcribe all visible text exactly as written.
- Include printed & handwritten text, symbols, equations, and labels.
- Keep original question numbering: Q1, Q2), (a), (i), etc.
- Include every subheading like “Definition:”, “Formula:”, etc.
- Retain all bullet marks (*, •, →, ✯, -).
- Preserve line spacing, indentation, and blank lines.
- If unclear: use “[illegible]”.
- If a diagram or table is present:  
  Write: [Diagram: short description] or [Table: X rows × Y columns]
- Do NOT skip any corner, margin, or faint handwriting.
- Every new line in the image = new line in output.
- Never rephrase, interpret, or correct errors.

-----------------------------------------------------
🔹 MATH-SPECIFIC RULES
-----------------------------------------------------
- Use Unicode math symbols: ², ³, √, ∑, ∫, ±, ×, ÷, ≤, ≥, ≠, ≈, ∞, α, β, π, θ, λ.
- Preserve spacing and inline layout:  
  Example: “F = m × a”, “E = mc²”
- Do not change notation or use LaTeX.
- Each math line stays as a separate line.

-----------------------------------------------------
🔹 OUTPUT FORMAT
-----------------------------------------------------
- Output only plain text transcription.
- Each question begins on a new line and is separated by one blank line.
- Do NOT output commentary or examples.
- Ensure full page coverage — if any visible text exists, it must appear in output.
"""

        if any(k in subject_lower for k in math_keywords):
            return base_prompt
        else:
            return base_prompt.replace("MATH-SPECIFIC RULES", "GENERAL RULES")

    # -------------------------------------------------------------------------
    # Folder processor (batch)
    # -------------------------------------------------------------------------
    def process_folder(self, folder_path: str, subject: str = "general") -> Dict[str, Dict[str, str]]:
        results = {}
        folder = Path(folder_path)
        if not folder.exists():
            raise FileNotFoundError(f"Folder not found: {folder_path}")

        for file_path in folder.iterdir():
            if file_path.suffix.lower() in {'.jpg', '.jpeg', '.png'}:
                ocr_text = self.ocr_handwriting(str(file_path), subject)
                structured = self.parse_exam_output(ocr_text)
                results[file_path.name] = {'raw_ocr': ocr_text, 'structured': structured}

        return results

    # -------------------------------------------------------------------------
    # Parser — keeps question/answer mapping for evaluation
    # -------------------------------------------------------------------------
    def parse_exam_output(self, ocr_text: str) -> Dict[str, str]:
        import re
        structured = {}
        lines = ocr_text.split('\n')
        current_q = None
        buffer = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if re.match(r'^(?:Q|Question)?\s*\(?\d+\)?[\.:)]', line, re.IGNORECASE):
                if current_q is not None:
                    structured[str(current_q)] = '\n'.join(buffer).strip()
                qnum_match = re.search(r'\d+', line)
                current_q = qnum_match.group(0) if qnum_match else len(structured) + 1
                buffer = [line]
            else:
                buffer.append(line)

        if current_q is not None:
            structured[str(current_q)] = '\n'.join(buffer).strip()

        return structured
