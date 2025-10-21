"""
Orchestrator for Multi-Agent Exam Evaluation System

Coordinates OCR, Alignment, Parser, and Evaluation agents asynchronously.
Handles both answer sheets and question keys.
"""

import asyncio
import logging
from typing import Dict, Any
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class Orchestrator:
    def __init__(self):
        # Agents will be imported here
        pass

    async def process_submission(self, answer_sheet_path: str, question_key_path: str) -> Dict[str, Any]:
        """
        Process an exam submission through the agent pipeline:
        1. Align answer sheet images
        2. Run OCR on aligned images
        3. Parse student answers from OCR text
        4. Parse question key from teacher file
        5. Evaluate answers against question key
        """
        try:
            logger.info(f"Starting evaluation for answer sheet: {answer_sheet_path}, question key: {question_key_path}")

            # Extract raw text from answer sheet before processing
            from .agents.parser_agent import extract_text_from_pdf, extract_text_from_docx
            from pathlib import Path
            answer_sheet_ext = Path(answer_sheet_path).suffix.lower()
            if answer_sheet_ext == '.pdf':
                raw_answer_sheet_text = extract_text_from_pdf(answer_sheet_path)
            else:
                # For images, we'll use OCR text as raw text
                raw_answer_sheet_text = "Image file - raw text extracted via OCR"

            # Extract raw text from question key before processing
            question_key_ext = Path(question_key_path).suffix.lower()
            if question_key_ext == '.pdf':
                raw_question_key_text = extract_text_from_pdf(question_key_path)
            elif question_key_ext == '.docx':
                raw_question_key_text = extract_text_from_docx(question_key_path)
            else:
                raw_question_key_text = "Unsupported file format"

            # Save raw data to raw_things folder
            import json
            import uuid

            # Use absolute path to raw_things folder from project root
            project_root = Path(__file__).parent.parent.parent
            raw_things_dir = project_root / "raw_things"
            raw_things_dir.mkdir(exist_ok=True)

            submission_id = str(uuid.uuid4())[:8]

            # Save raw answer sheet text
            raw_answer_sheet_data = {
                "file_path": answer_sheet_path,
                "file_type": answer_sheet_ext,
                "raw_text": raw_answer_sheet_text,
                "extraction_timestamp": str(datetime.now())
            }
            answer_sheet_file = raw_things_dir / f"raw_answer_sheet_{submission_id}.json"
            with open(answer_sheet_file, 'w', encoding='utf-8') as f:
                json.dump(raw_answer_sheet_data, f, indent=2, ensure_ascii=False)

            # Save raw question key text
            raw_question_key_data = {
                "file_path": question_key_path,
                "file_type": question_key_ext,
                "raw_text": raw_question_key_text,
                "extraction_timestamp": str(datetime.now())
            }
            question_key_raw_file = raw_things_dir / f"raw_question_key_{submission_id}.json"
            with open(question_key_raw_file, 'w', encoding='utf-8') as f:
                json.dump(raw_question_key_data, f, indent=2, ensure_ascii=False)

            # Step 1: Use test_ocr_only for complete OCR processing (includes alignment, OCR, and parsing)
            import sys
            from pathlib import Path
            project_root = Path(__file__).parent.parent.parent
            if str(project_root) not in sys.path:
                sys.path.insert(0, str(project_root))
            from test_ocr_only import process_ocr_only
            ocr_result = await asyncio.to_thread(process_ocr_only, answer_sheet_path)
            student_answers = ocr_result.get("questions", {})
            full_ocr_text = f"OCR processed via test_ocr_only for {len(student_answers)} questions"

            # Clean up GPU memory after OCR processing
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                logger.info("GPU cache cleared after OCR processing")

            # Step 2: Parse question key
            from .agents.parser_agent import parse_question_key
            question_key_data = await asyncio.to_thread(parse_question_key, question_key_path)
            subject = question_key_data.get("subject", "general")
            question_key = question_key_data.get("questions", {})

            # Step 5: Evaluate
            from .agents.evaluation_agent_mistral import evaluate_answers
            eval_success = await asyncio.to_thread(evaluate_answers, student_answers, question_key)
            
            if eval_success:
                from .agents.result_agent import parse_llama_results
                evaluation_result = await asyncio.to_thread(parse_llama_results)
                
                # Handle new evaluation format
                if isinstance(evaluation_result, dict) and 'evaluations' in evaluation_result:
                    evaluations = evaluation_result['evaluations']
                    
                    # Convert binary scores (0/1) to actual marks
                    for q_key, eval_data in evaluations.items():
                        if q_key in question_key:
                            actual_marks = question_key[q_key].get('marks', 1)
                            eval_data['score'] = actual_marks if eval_data.get('score', 0) == 1 else 0
                    
                    total_score = sum(eval_data.get('score', 0) for eval_data in evaluations.values())
                    max_score = sum(q.get('marks', 0) for q in question_key.values())
                else:
                    # Fallback to old format
                    evaluations = evaluation_result
                    total_score = sum(result.get('score', 0) for result in evaluations.values())
                    max_score = sum(q.get('marks', 0) for q in question_key.values())
            else:
                logger.error("Evaluation failed completely")
                evaluations = {}
                total_score = 0
                max_score = sum(q.get('marks', 0) for q in question_key.values())

            result = {
                'subject': subject,
                'raw_ocr': full_ocr_text,
                'student_answers': student_answers,
                'parsed_question_key': question_key_data,  # Renamed for clarity
                'question_key': question_key,  # Structured questions dict
                'evaluation': evaluations,
                'total_score': total_score,
                'max_score': max_score,
                'status': 'success' if eval_success else 'failed'
            }

            # Save parsed data to raw_things folder
            import json
            import uuid

            # Use absolute path to raw_things folder from project root
            project_root = Path(__file__).parent.parent.parent
            raw_things_dir = project_root / "raw_things"
            raw_things_dir.mkdir(exist_ok=True)

            submission_id = str(uuid.uuid4())[:8]

            # Save parsed data to raw_things folder (using same submission_id)
            # Save parsed question key
            parsed_question_key_data = {
                "parsed_data": question_key_data,
                "parsing_timestamp": str(datetime.now())
            }
            parsed_question_key_file = raw_things_dir / f"parsed_question_key_{submission_id}.json"
            with open(parsed_question_key_file, 'w', encoding='utf-8') as f:
                json.dump(parsed_question_key_data, f, indent=2, ensure_ascii=False)

            # Save parsed student answers
            parsed_answers_data = {
                "parsed_answers": student_answers,
                "parsing_timestamp": str(datetime.now())
            }
            parsed_answers_file = raw_things_dir / f"parsed_student_answers_{submission_id}.json"
            with open(parsed_answers_file, 'w', encoding='utf-8') as f:
                json.dump(parsed_answers_data, f, indent=2, ensure_ascii=False)

            # Save raw OCR text
            ocr_data = {
                "raw_ocr_text": full_ocr_text,
                "ocr_timestamp": str(datetime.now())
            }
            ocr_file = raw_things_dir / f"ocr_output_{submission_id}.json"
            with open(ocr_file, 'w', encoding='utf-8') as f:
                json.dump(ocr_data, f, indent=2, ensure_ascii=False)

            logger.info(f"Saved all data to raw_things folder with ID: {submission_id}")
            logger.info(f"Evaluation completed. Score: {total_score}/{max_score}")
            return result

        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
            return {
                'error': str(e),
                'status': 'failed'
            }