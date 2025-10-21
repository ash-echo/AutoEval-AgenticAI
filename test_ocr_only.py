import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.agents.ocr_agent_qwen import OCREngine
from app.agents.parser_agent import extract_text_from_pdf
from pathlib import Path

def test_ocr_only():
    # Test OCR extraction only
    print("Testing OCR extraction only...")

    # Use the same files as the orchestrator test
    answer_sheet = r"A:\progash\gg\ans phy.pdf"

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

        # OCR each page
        all_ocr_texts = []
        for i, img_path in enumerate(image_paths):
            print(f"OCR processing page {i+1}: {img_path}")
            ocr_text = ocr_engine.ocr_handwriting(img_path, "physics")
            print(f"OCR Result page {i+1}: {ocr_text[:300]}...")
            all_ocr_texts.append(ocr_text)

        full_ocr_text = '\n\n'.join(all_ocr_texts)
        print(f"\nFull OCR Text:\n{full_ocr_text}")

        # Parse the answers
        print("\nParsing student answers...")
        student_answers = ocr_engine.parse_exam_output(full_ocr_text)
        print(f"Parsed answers: {student_answers}")

        print("\n✅ OCR test completed successfully!")

    except Exception as e:
        print(f"❌ OCR test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ocr_only()