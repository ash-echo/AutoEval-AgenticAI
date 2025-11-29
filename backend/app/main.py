"""
FastAPI backend for the multi-agent exam evaluation system.
"""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .orchestrator import Orchestrator
from .database import db
from .models.schemas import SubmissionRequest, SubmissionResponse, AnalyticsResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Exam Evaluation API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Global variables for file paths (in production, use database)
uploaded_files = {}

# Database events - disabled for testing
@app.on_event("startup")
async def startup_event():
    try:
        await db.connect()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.warning(f"Database connection failed: {e}. Running in offline mode.")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        await db.disconnect()
    except:
        pass

@app.post("/upload/answer_sheet", response_model=dict)
async def upload_answer_sheet(file: UploadFile = File(...)):
    """
    Upload student's answer sheet (PDF or image).
    """
    try:
        # Validate file type
        allowed_exts = {'.pdf', '.jpg', '.jpeg', '.png'}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only PDF and image files are supported for answer sheets")

        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_answer_sheet{file_ext}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        uploaded_files[file_id] = {"answer_sheet": str(file_path)}
        logger.info(f"Answer sheet saved: {file_path}")

        return {"file_id": file_id, "message": "Answer sheet uploaded successfully"}

    except Exception as e:
        logger.error(f"Answer sheet upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/question_key", response_model=dict)
async def upload_question_key(file: UploadFile = File(...)):
    """
    Upload teacher's question key (PDF or DOCX).
    """
    try:
        # Validate file type
        allowed_exts = {'.pdf', '.docx'}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported for question keys")

        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_question_key{file_ext}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        uploaded_files[file_id] = {"question_key": str(file_path)}
        logger.info(f"Question key saved: {file_path}")

        return {"file_id": file_id, "message": "Question key uploaded successfully"}

    except Exception as e:
        logger.error(f"Question key upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process", response_model=dict)
async def process_submission(
    answer_sheet_id: str = Form(...),
    question_key_id: str = Form(...),
    student_name: str = Form("Anonymous"),
    subject: str = Form("General")
):
    """
    Trigger multi-agent processing pipeline for uploaded files.
    """
    try:
        # Check if both file IDs exist
        if answer_sheet_id not in uploaded_files:
            raise HTTPException(status_code=404, detail="Answer sheet file ID not found")
        if question_key_id not in uploaded_files:
            raise HTTPException(status_code=404, detail="Question key file ID not found")

        # Get file paths
        answer_sheet_files = uploaded_files[answer_sheet_id]
        question_key_files = uploaded_files[question_key_id]

        if "answer_sheet" not in answer_sheet_files:
            raise HTTPException(status_code=400, detail="Answer sheet file not found")
        if "question_key" not in question_key_files:
            raise HTTPException(status_code=400, detail="Question key file not found")

        answer_sheet_path = answer_sheet_files["answer_sheet"]
        question_key_path = question_key_files["question_key"]

        # Process the submission
        orchestrator = Orchestrator()
        result = await orchestrator.process_submission(answer_sheet_path, question_key_path)

        # Add student info to result
        result['student_name'] = student_name
        result['subject'] = result.get('subject', subject)

        # Save to database (optional, for analytics)
        try:
            from datetime import datetime
            submission = {
                "student_name": student_name,
                "subject": result.get("subject", subject),
                "timestamp": datetime.utcnow(),
                "status": result.get("status", "unknown")
            }
            submission_id = await db.save_submission(submission)

            answers = {
                "submission_id": submission_id,
                "answers": result.get("student_answers", {})
            }
            await db.save_answers(answers)

            evaluation = {
                "submission_id": submission_id,
                "results": result.get("evaluation", {}),
                "total_score": result.get("total_score", 0),
                "max_score": result.get("max_score", 0)
            }
            await db.save_evaluation(evaluation)

            result['submission_id'] = submission_id
        except Exception as db_error:
            logger.warning(f"Database save failed: {db_error}. Continuing without database.")

        return result

    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{submission_id}", response_model=dict)
async def get_results(submission_id: str):
    """
    Fetch detailed result for a submission.
    """
    try:
        submission = await db.get_submission(submission_id)
        answers = await db.get_answers(submission_id)
        evaluation = await db.get_evaluation(submission_id)

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        return {
            "submission": submission,
            "answers": answers,
            "evaluation": evaluation
        }

    except Exception as e:
        logger.error(f"Failed to retrieve results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """
    View performance analytics.
    """
    try:
        analytics = await db.get_analytics()
        return AnalyticsResponse(**analytics)

    except Exception as e:
        logger.error(f"Failed to get analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process_visual", response_model=dict)
async def process_visual_questions(file: UploadFile = File(...)):
    """
    Process visual question papers with MCQs, diagrams, and fill-in-the-blanks.
    Mode 2: Visual Question Analysis
    """
    try:
        # Validate file type
        allowed_exts = {'.pdf', '.jpg', '.jpeg', '.png'}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_exts:
            raise HTTPException(status_code=400, detail="Only PDF and image files are supported for visual questions")

        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_visual_questions{file_ext}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        logger.info(f"Visual question paper saved: {file_path}")

        # Convert PDF to image if needed
        if file_ext == '.pdf':
            try:
                from pdf2image import convert_from_path
                pages = convert_from_path(str(file_path))
                if pages:
                    # Use first page for now
                    image_path = UPLOAD_DIR / f"{file_id}_visual_page_1.jpg"
                    pages[0].save(image_path, 'JPEG')
                    processing_path = str(image_path)
                else:
                    raise HTTPException(status_code=400, detail="Could not extract pages from PDF")
            except ImportError:
                raise HTTPException(status_code=400, detail="PDF processing not available. Please upload image files.")
        else:
            processing_path = str(file_path)

        # Process visual questions
        from .agents.visual_question_agent import process_visual_questions
        result = await asyncio.to_thread(process_visual_questions, processing_path)

        # Clean up GPU memory
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logger.info("GPU cache cleared after visual processing")

        # Add metadata
        result.update({
            'file_id': file_id,
            'filename': file.filename,
            'processing_type': 'visual_questions',
            'timestamp': str(datetime.utcnow())
        })

        # Save results to raw_things folder
        project_root = Path(__file__).parent.parent.parent
        raw_things_dir = project_root / "raw_things"
        raw_things_dir.mkdir(exist_ok=True)

        visual_results_file = raw_things_dir / f"visual_analysis_{file_id[:8]}.json"
        with open(visual_results_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        logger.info(f"Visual analysis completed. Found {result.get('total_questions', 0)} questions")
        return result

    except Exception as e:
        logger.error(f"Visual processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))