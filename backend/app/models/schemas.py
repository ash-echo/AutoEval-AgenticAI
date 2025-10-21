"""
Pydantic models for the exam evaluation system.
"""

from pydantic import BaseModel
from typing import Dict, Optional, List, Any, List
from datetime import datetime

class SubmissionRequest(BaseModel):
    answer_sheet_path: str
    question_key_path: str
    student_name: Optional[str] = "Anonymous"
    subject: Optional[str] = "General"

class SubmissionResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    student_name: str
    subject: str
    total_score: Optional[int] = None
    max_score: Optional[int] = None

class AnswerModel(BaseModel):
    submission_id: str
    answers: Dict[str, str]

class EvaluationModel(BaseModel):
    submission_id: str
    results: Dict[str, Dict[str, Any]]
    total_score: int
    max_score: int

class AnalyticsResponse(BaseModel):
    total_submissions: int
    average_score: float
    subject_breakdown: Dict[str, int]