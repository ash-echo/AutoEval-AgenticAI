"""
Evaluation Agent: AI-powered grading using Ollama LLaMA3

Evaluates structured answers against question key answers using rubric-based grading.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

try:
    import ollama
except ImportError:
    logger.error("Ollama not installed. Install with: pip install ollama")
    ollama = None

def evaluate_answers(student_answers: Dict[str, str], question_key: Dict[str, Dict[str, Any]]) -> bool:
    """
    Evaluate each student answer against the question key using LLaMA3.
    Saves raw LLaMA response to LamaRes folder and returns success status.
    """
    if not ollama:
        logger.warning("Ollama not installed, using fallback evaluation")
        return fallback_evaluate_answers(student_answers, question_key)

    try:
        # Prepare questions and answers for LLM
        formatted_questions = []
        formatted_answers = []
        all_question_nums = set()
        for q_num in question_key.keys():
            if q_num.startswith('Q'):
                num = q_num[1:]
            else:
                num = q_num
            all_question_nums.add(num)
        for q_num in student_answers.keys():
            all_question_nums.add(q_num)
        sorted_questions = sorted(all_question_nums, key=lambda x: int(x) if x.isdigit() else 999)
        for q_num in sorted_questions:
            q_key = f"Q{q_num}"
            if q_key in question_key:
                q_data = question_key[q_key]
                question = q_data.get('question', '[Question not found]')
                ideal_answer = q_data.get('ideal_answer', None)
                marks = q_data.get('marks', None)
                formatted = f"Q{q_num}: {question}"
                if ideal_answer:
                    formatted += f"\nIdeal Answer: {ideal_answer}"
                if marks:
                    formatted += f"\nMarks: {marks}"
                formatted_questions.append(formatted)
            else:
                formatted_questions.append(f"Q{q_num}: [Question not found in key]")
            if q_num in student_answers:
                formatted_answers.append(f"Q{q_num}: {student_answers[q_num]}")
            else:
                formatted_answers.append(f"Q{q_num}: [No answer provided]")
        questions_text = "\n\n".join(formatted_questions)
        answers_text = "\n\n".join(formatted_answers)
        # Comprehensive evaluation
        success = evaluate_all_answers_comprehensive(questions_text, answers_text)
        return success
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        return False
def evaluate_all_answers_comprehensive(questions_text: str, answers_text: str) -> bool:
    """
    Use LLaMA3 to evaluate all answers at once, save raw response to LamaRes folder.
    Returns True if successful, False otherwise.
    """
    import json
    import re
    import os
    from pathlib import Path
    if not ollama:
        return False
    prompt = f"""
You are an expert exam evaluator. Evaluate the student's answers against the question key.

For each question, provide an evaluation in this format:
Q1: [Question text] - [Student's OCR text] - [Right/Wrong with brief explanation]
Q2: [Question text] - [Student's OCR text] - [Right/Wrong with brief explanation]
...

Questions:
{questions_text}

Student Answers:
{answers_text}

Keep it simple and direct.
"""
    try:
        response = ollama.chat(
            model='mistral',
            messages=[{'role': 'user', 'content': prompt}],
            options={'temperature': 0.2, 'timeout': 60}
        )
        result_text = response['message']['content'].strip()
        
        # Save raw response to project root
        script_dir = Path(__file__).parent
        project_root = script_dir.parent.parent.parent
        output_file = project_root / "llama_output.txt"
        
        logger.info(f"Evaluation agent saving llama_output.txt to: {output_file}")
        logger.info(f"Absolute path: {output_file.absolute()}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(result_text)
        
        logger.info(f"Saved LLaMA output to {output_file}")
        
        # Clear Ollama cache after evaluation to free memory for result agent
        try:
            import subprocess
            logger.info("Stopping Ollama service to free memory for result agent...")
            # Stop Ollama to free up memory
            result = subprocess.run('ollama stop', 
                                  shell=True, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info("Ollama service stopped successfully")
            else:
                logger.warning(f"Failed to stop Ollama: {result.stderr}")
        except Exception as e:
            logger.warning(f"Could not stop Ollama service: {e}")
        
        return True
    except Exception as e:
        logger.error(f"Comprehensive evaluation failed: {e}")
        return False


def fallback_evaluate_answers(student_answers: Dict[str, str], question_key: Dict[str, Dict[str, Any]]) -> bool:
    """
    Simple fallback evaluation when Ollama is not available or fails.
    Saves fallback results to LamaRes folder.
    """
    import json
    from pathlib import Path
    
    evaluations = {}
    # Get all question numbers
    all_question_nums = set()
    for q_num in question_key.keys():
        if q_num.startswith('Q'):
            num = q_num[1:]
        else:
            num = q_num
        all_question_nums.add(num)
    for q_num in student_answers.keys():
        all_question_nums.add(q_num)
    for q_num in all_question_nums:
        q_key = f"Q{q_num}"
        student_answer = student_answers.get(q_num, "")
        if q_key in question_key:
            question_data = question_key[q_key]
            max_marks = question_data["marks"]
            if not student_answer or student_answer.strip() == "":
                score = 0
                feedback = "No answer provided"
            elif len(student_answer.strip()) < 10:
                score = max(1, max_marks // 4)
                feedback = "Answer too brief - please provide more detail"
            else:
                score = max_marks // 2
                feedback = "Answer submitted - detailed evaluation requires AI grading"
            evaluations[q_num] = {
                "score": score,
                "feedback": feedback,
                "strengths": "Attempted to answer" if student_answer.strip() else "",
                "improvements": "Provide more detailed response" if len(student_answer.strip()) < 20 else ""
            }
        else:
            evaluations[q_num] = {
                "score": 0,
                "feedback": "Question not found in question key"
            }
    
    # Calculate totals
    total_score = sum(v.get('score', 0) for v in evaluations.values())
    max_score = sum(q.get('marks', 0) for q in question_key.values() if isinstance(q, dict) and 'marks' in q)
    
    # Save to project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent.parent
    output_file = project_root / "llama_output.txt"
    fallback_data = {
        "evaluations": evaluations,
        "total_score": total_score,
        "max_score": max_score
    }
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fallback_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Fallback evaluation saved to {output_file}")
    return True