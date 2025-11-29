"""
Result Agent: Uses Mistral LLM to analyze LLaMA output and provide detailed evaluation results

Reads the raw LLaMA response from llama_output.txt and uses Mistral LLM to extract
structured evaluation data with detailed feedback, strengths, and improvements.
"""

import logging
import json
import re
from pathlib import Path
from typing import Dict, Any

try:
    import ollama
except ImportError:
    logger = logging.getLogger(__name__)
    logger.error("Ollama not installed. Install with: pip install ollama")
    ollama = None

logger = logging.getLogger(__name__)

def parse_llama_results() -> Dict[str, Any]:
    """
    Read LLaMA output from llama_output.txt and use Mistral LLM to analyze and structure the results.
    Returns {"evaluations": {...}, "total_score": int, "max_score": int}
    """
    try:
        script_dir = Path(__file__).parent
        project_root = script_dir.parent.parent.parent
        output_file = project_root / "llama_output.txt"

        logger.info(f"Result agent looking for llama_output.txt at: {output_file}")
        logger.info(f"Absolute path: {output_file.absolute()}")

        if not output_file.exists():
            logger.error(f"LLaMA output file not found: {output_file}")
            return {"evaluations": {}, "total_score": 0, "max_score": 0}

        with open(output_file, 'r', encoding='utf-8') as f:
            result_text = f.read().strip()

        if not result_text:
            logger.error("LLaMA output file is empty")
            return {"evaluations": {}, "total_score": 0, "max_score": 0}

        logger.info(f"Read {len(result_text)} characters from llama_output.txt")

        # First, parse the evaluation results to determine correctness and extract marks if present
        evaluations = {}
        lines = result_text.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith('Q') and ':' in line:
                # Found a question line like "Q1: Question text"
                q_match = re.match(r'Q(\d+)', line)
                if q_match:
                    q_num = f"Q{q_match.group(1)}"
                    raw_evaluation = line
                    score = None
                    is_correct = False
                    # Collect all lines for this question block
                    block_lines = [line]
                    j = i + 1
                    while j < len(lines) and not (lines[j].strip().startswith('Q') and ':' in lines[j]):
                        block_lines.append(lines[j].strip())
                        j += 1
                    block_text = '\n'.join(block_lines)
                    # Try to extract marks or evaluation marker from any line in the block
                    found = False
                    for l in block_lines:
                        marks_match_inline = re.search(r'\(Marks:?\s*(\d+(?:\.\d+)?)\)', l, re.IGNORECASE)
                        if marks_match_inline:
                            try:
                                score = float(marks_match_inline.group(1))
                            except Exception:
                                score = 0.0
                            is_correct = score > 0.0
                            found = True
                            break
                        elif re.search(r'\bRight\b', l, re.IGNORECASE):
                            score = 1.0
                            is_correct = True
                            found = True
                            break
                        elif re.search(r'\bWrong\b', l, re.IGNORECASE):
                            score = 0.0
                            is_correct = False
                            found = True
                            break
                    # If not found, check for marks in the block as before
                    if not found:
                        for l in block_lines:
                            marks_match = re.search(r'(?:Marks Awarded|Score)\s*[:=]\s*(\d+(?:\.\d+)?)\s*(?:/\s*(\d+(?:\.\d+)?))?', l, re.IGNORECASE)
                            if marks_match:
                                if marks_match.group(2):
                                    try:
                                        score = float(marks_match.group(1)) / float(marks_match.group(2))
                                    except Exception:
                                        score = float(marks_match.group(1))
                                else:
                                    score = float(marks_match.group(1))
                                is_correct = score > 0.0
                                found = True
                                break
                    if score is None:
                        score = 0.0
                    evaluations[q_num] = {
                        "score": score,
                        "is_correct": is_correct,
                        "raw_evaluation": block_text.strip()
                    }
                    i = j
                else:
                    i += 1
            else:
                i += 1
        
        logger.info(f"Parsed {len(evaluations)} question evaluations from llama_output.txt")
        
        # Now enhance with detailed feedback using Mistral
        if evaluations:
            enhanced_evaluations = {}
            
            for q_num, eval_data in evaluations.items():
                if ollama:  # Only enhance if ollama is available
                    try:
                        feedback_prompt = f"""
Based on this evaluation result, provide detailed feedback for the student:

Evaluation: {eval_data['raw_evaluation']}

Provide a JSON response with:
{{
    "feedback": "detailed explanation of the evaluation",
    "strengths": "what the student did well",
    "improvements": "specific suggestions for improvement"
}}
"""
                        response = ollama.chat(
                            model='mistral',
                            messages=[{'role': 'user', 'content': feedback_prompt}],
                            options={'temperature': 0.1}
                        )
                        
                        feedback_response = response['message']['content'].strip()
                        
                        # Try to extract JSON
                        json_start = feedback_response.find('{')
                        json_end = feedback_response.rfind('}') + 1
                        
                        if json_start != -1 and json_end > json_start:
                            feedback_data = json.loads(feedback_response[json_start:json_end])
                            enhanced_evaluations[q_num] = {
                                "score": eval_data["score"],
                                "feedback": feedback_data.get("feedback", eval_data["raw_evaluation"]),
                                "strengths": feedback_data.get("strengths", "Answer submitted" if eval_data["is_correct"] else ""),
                                "improvements": feedback_data.get("improvements", "Review the concept" if not eval_data["is_correct"] else "")
                            }
                        else:
                            # Fallback to basic feedback
                            enhanced_evaluations[q_num] = {
                                "score": eval_data["score"],
                                "feedback": eval_data["raw_evaluation"],
                                "strengths": "Correct answer" if eval_data["is_correct"] else "",
                                "improvements": "Review the concept" if not eval_data["is_correct"] else ""
                            }
                            
                    except Exception as e:
                        logger.warning(f"Failed to enhance feedback for {q_num}: {e}")
                        enhanced_evaluations[q_num] = {
                            "score": eval_data["score"],
                            "feedback": eval_data["raw_evaluation"],
                            "strengths": "Correct answer" if eval_data["is_correct"] else "",
                            "improvements": "Review the concept" if not eval_data["is_correct"] else ""
                        }
                else:
                    # Ollama not available, use basic feedback
                    logger.warning("Ollama not available for feedback enhancement, using basic feedback")
                    enhanced_evaluations[q_num] = {
                        "score": eval_data["score"],
                        "feedback": eval_data["raw_evaluation"],
                        "strengths": "Correct answer" if eval_data["is_correct"] else "",
                        "improvements": "Review the concept" if not eval_data["is_correct"] else ""
                    }
            
            evaluations = enhanced_evaluations
        
        # Calculate totals
        total_score = sum(float(v.get('score', 0)) for v in evaluations.values())
        max_score = len(evaluations)

        return {
            "evaluations": evaluations,
            "total_score": total_score,
            "max_score": max_score
        }

    except Exception as e:
        logger.error(f"Failed to parse LLaMA results: {e}")
        return {"evaluations": {}, "total_score": 0, "max_score": 0}