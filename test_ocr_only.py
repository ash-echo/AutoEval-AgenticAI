import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.agents.ocr_agent_qwen import OCREngine
from app.agents.parser_agent import extract_text_from_pdf
from app.agents.alignment_agent import process_pdf_to_images
from pathlib import Path
from typing import Dict

def process_ocr_only(pdf_path: str) -> Dict[str, str]:
    """
    Process OCR for a PDF and return student answers.
    This is the same logic as test_ocr_only but as a callable function.
    """
    print(f"Processing OCR for: {pdf_path}")

    try:
        # Initialize OCR engine
        ocr_engine = OCREngine()

        # Convert PDF to images
        from app.agents.alignment_agent import process_pdf_to_images
        image_paths = process_pdf_to_images(pdf_path)
        print(f"Found {len(image_paths)} pages")

        # OCR each page and accumulate all questions
        all_ocr_texts = []
        for i, img_path in enumerate(image_paths):
            print(f"OCR processing page {i+1}: {img_path}")
            ocr_text = ocr_engine.ocr_handwriting(img_path, "physics")
            all_ocr_texts.append(ocr_text)

        # Combine all pages into one document
        full_ocr_text = '\n\n'.join(all_ocr_texts)

        # Parse all questions from the combined document
        student_answers = ocr_engine.parse_exam_output(full_ocr_text)
        print(f"Found {len(student_answers)} questions total: {list(student_answers.keys())}")

        # Optional: Save to JSON files (can be disabled if not needed)
        _save_ocr_results(student_answers, pdf_path)

        # Clean up GPU memory
        import torch
        import gc
        if hasattr(ocr_engine, 'model'):
            del ocr_engine.model
        if hasattr(ocr_engine, 'tokenizer'):
            del ocr_engine.tokenizer
        if hasattr(ocr_engine, 'processor'):
            del ocr_engine.processor
        del ocr_engine
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        print("GPU memory cleaned up after OCR processing")

        return {"questions": student_answers}

    except Exception as e:
        print(f"OCR processing failed: {e}")
        raise

def _save_ocr_results(student_answers: Dict[str, str], pdf_path: str):
    """Save parsed answers to JSON files."""
    import json
    import uuid
    
    correct_ocr_dir = Path(__file__).parent / "backend" / "correct_ocr"
    correct_ocr_dir.mkdir(exist_ok=True, parents=True)
    
    submission_id = str(uuid.uuid4())[:8]
    pdf_name = Path(pdf_path).stem.replace(' ', '_')
    
    pdf_folder = correct_ocr_dir / f"{pdf_name}_{submission_id}"
    pdf_folder.mkdir(exist_ok=True, parents=True)
    
    for question_num, answer_text in student_answers.items():
        answer_lines = [line.strip() for line in answer_text.split('\n') if line.strip()]
        clean_answer = '\n'.join(answer_lines)
        
        question_data = {
            "question_number": question_num,
            "Answer": clean_answer,
            "pdf_file": str(pdf_path)
        }
        
        question_file = pdf_folder / f"question_{question_num}.json"
        with open(question_file, 'w', encoding='utf-8') as f:
            json.dump(question_data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved question {question_num} to {question_file}")

def test_ocr_only():
    # Test OCR extraction only
    print("Testing OCR extraction only...")

    # Use the same files as the orchestrator test
    answer_sheet = r"A:\progash\ocr\sample_images\answer sheet.pdf"

    print(f"Processing: {answer_sheet}")

    try:
        # Extract raw text first (if it's a PDF)
        file_ext = Path(answer_sheet).suffix.lower()
        if file_ext == '.pdf':
            print("Extracting raw text from PDF...")
            raw_text = extract_text_from_pdf(answer_sheet)
            print(f"Raw PDF text: {raw_text[:200]}...")

        # Initialize OCR engine
        print("Initializing OCR engine...")
        ocr_engine = OCREngine()

        # For PDF, we need to convert to images first
        from app.agents.alignment_agent import process_pdf_to_images

        print("Converting PDF to images...")
        image_paths = process_pdf_to_images(answer_sheet)

        print(f"Found {len(image_paths)} pages")

        # Create correct_ocr directory
        correct_ocr_dir = Path(__file__).parent / "backend" / "correct_ocr"
        correct_ocr_dir.mkdir(exist_ok=True, parents=True)

        # OCR each page and accumulate all questions
        print("\nProcessing all pages and accumulating questions...")
        
        all_ocr_texts = []
        for i, img_path in enumerate(image_paths):
            print(f"OCR processing page {i+1}: {img_path}")
            ocr_text = ocr_engine.ocr_handwriting(img_path, "physics")
            print(f"OCR Result page {i+1}: {ocr_text[:300]}...")
            all_ocr_texts.append(ocr_text)

        # Combine all pages into one document
        full_ocr_text = '\n\n'.join(all_ocr_texts)
        print(f"\nCombined OCR Text:\n{full_ocr_text[:500]}...")

        # Parse all questions from the combined document
        student_answers = ocr_engine.parse_exam_output(full_ocr_text)
        print(f"Found {len(student_answers)} questions total: {list(student_answers.keys())}")

        import json
        import uuid
        from datetime import datetime

        submission_id = str(uuid.uuid4())[:8]
        pdf_name = Path(answer_sheet).stem.replace(' ', '_')  # Clean filename for folder

        # Create subfolder for this PDF
        pdf_folder = correct_ocr_dir / f"{pdf_name}_{submission_id}"
        pdf_folder.mkdir(exist_ok=True, parents=True)

        # Save each question as separate JSON file
        for question_num, answer_text in student_answers.items():
            # Preserve newlines in the answer
            answer_lines = [line.strip() for line in answer_text.split('\n') if line.strip()]
            clean_answer = '\n'.join(answer_lines)

            question_data = {
                "question_number": question_num,
                "Answer": clean_answer,
                "pdf_file": str(answer_sheet)
            }

            question_file = pdf_folder / f"question_{question_num}.json"
            with open(question_file, 'w', encoding='utf-8') as f:
                json.dump(question_data, f, indent=2, ensure_ascii=False)

            print(f"Saved question {question_num} to {question_file}")

        print(f"\n✅ OCR test completed successfully! Found {len(student_answers)} questions total across {len(image_paths)} pages.")
        print(f"Results saved to {pdf_folder}")

    except Exception as e:
        print(f"❌ OCR test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ocr_only()