"""
Result Agent: Parses LLaMA output from LamaRes folder into structured evaluation results

Reads the raw LLaMA response from LamaRes/llama_output.txt and extracts structured evaluation data.
"""

import logging
import json
import re
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

def parse_llama_results() -> Dict[str, Any]:
    """
    Read LLaMA output from LamaRes folder and parse into structured evaluation format.
    Returns {"evaluations": {...}, "total_score": int, "max_score": int}
    """
    try:
        script_dir = Path(__file__).parent
        project_root = script_dir.parent.parent.parent
        output_file = project_root / "llama_output.txt"
        
        if not output_file.exists():
            logger.error(f"LLaMA output file not found: {output_file}")
            return {"evaluations": {}, "total_score": 0, "max_score": 0}
        
        with open(output_file, 'r', encoding='utf-8') as f:
            result_text = f.read().strip()
        
        # Try to parse as JSON first (for fallback case)
        try:
            data = json.loads(result_text)
            if isinstance(data, dict) and 'evaluations' in data:
                return data
        except json.JSONDecodeError:
            pass
        
        # Parse format: Q#: Question - Student answer - Assessment
        evaluations = {}
        lines = result_text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('Q') and ':' in line:
                parts = line.split(':', 1)
                q_num = parts[0].strip()
                content = parts[1].strip()
                
                # Split by " - " to get question, student answer, assessment
                if ' - ' in content:
                    sections = content.split(' - ', 2)
                    if len(sections) >= 3:
                        question = sections[0].strip()
                        student_answer = sections[1].strip()
                        assessment = sections[2].strip()
                    else:
                        question = content
                        student_answer = ""
                        assessment = "Not properly formatted"
                else:
                    question = content
                    student_answer = ""
                    assessment = "No assessment provided"
                
                # Simple scoring: if "right" in assessment, give full marks, else 0
                score = 1 if 'right' in assessment.lower() else 0
                evaluations[q_num] = {
                    "score": score,
                    "feedback": f"Question: {question}\nStudent: {student_answer}\nAssessment: {assessment}",
                    "strengths": "Correct" if score == 1 else "",
                    "improvements": "Review answer" if score == 0 else ""
                }
        
        # Calculate totals (assuming each question is worth 1 mark for simplicity)
        total_score = sum(v.get('score', 0) for v in evaluations.values())
        max_score = len(evaluations)
        
        return {
            "evaluations": evaluations,
            "total_score": total_score,
            "max_score": max_score
        }
            
    except Exception as e:
        logger.error(f"Failed to parse LLaMA results: {e}")
        return {"evaluations": {}, "total_score": 0, "max_score": 0}