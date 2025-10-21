import sys
import os
import json
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.agents.evaluation_agent_llama import evaluate_answers
from app.agents.result_agent import parse_llama_results

def test_evaluation_only():
    print("Testing evaluation only...")

    # Load the parsed data from raw_things
    submission_id = "4b0098ef"  # From the files we saw

    try:
        # Load OCR output
        with open(f"raw_things/ocr_output_{submission_id}.json", 'r') as f:
            ocr_data = json.load(f)
        raw_ocr_text = ocr_data["raw_ocr_text"]
        print(f"Loaded OCR text (first 200 chars): {raw_ocr_text[:200]}...")

        # Load student answers
        with open(f"raw_things/parsed_student_answers_{submission_id}.json", 'r') as f:
            student_data = json.load(f)
        student_answers = student_data["parsed_answers"]
        print(f"Loaded student answers: {list(student_answers.keys())}")

        # Load question key
        with open(f"raw_things/parsed_question_key_{submission_id}.json", 'r') as f:
            question_data = json.load(f)
        question_key = question_data["parsed_data"]["questions"]
        print(f"Loaded question key: {list(question_key.keys())}")

        # Convert student_answers keys to match question_key format (add Q prefix if needed)
        converted_answers = {}
        for k, v in student_answers.items():
            if not k.startswith('Q'):
                converted_answers[f"Q{k}"] = v
            else:
                converted_answers[k] = v

        print(f"Converted student answers keys: {list(converted_answers.keys())}")

        # First, let's evaluate the parsing accuracy with LLM
        print("\n=== EVALUATING OCR PARSING ACCURACY ===")
        evaluate_parsing_accuracy(raw_ocr_text, question_key, converted_answers)

        # Then run the actual answer evaluation
        print("\n=== EVALUATING STUDENT ANSWERS ===")
        eval_success = evaluate_answers(converted_answers, question_key)

        if eval_success:
            print("Answer evaluation successful, parsing results...")
            evaluation_result = parse_llama_results()
            print("Answer evaluation results:")
            print(json.dumps(evaluation_result, indent=2))
        else:
            print("Answer evaluation failed")

    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()

def evaluate_parsing_accuracy(raw_ocr_text, question_key, student_answers):
    """Use LLM to evaluate if the OCR parsing is accurate"""
    try:
        import ollama

        prompt = f"""
You are an expert at evaluating OCR parsing accuracy for exam papers.

Given:
1. Raw OCR text extracted from an exam image
2. Parsed question key (what questions should be on the exam)
3. Parsed student answers (how the OCR text was divided into questions)

Evaluate whether the parsing is correct. Check if:
- The OCR text contains answers for all expected questions
- The answers are correctly separated by question
- No important content was missed or misassigned
- The parsing logic properly identified question boundaries

Raw OCR Text:
{raw_ocr_text}

Expected Questions:
{json.dumps(question_key, indent=2)}

Parsed Student Answers:
{json.dumps(student_answers, indent=2)}

Provide a detailed assessment of the parsing accuracy. Score it from 1-10 and explain any issues.
"""

        print("Evaluating parsing accuracy with LLM...")
        response = ollama.chat(
            model='mistral',
            messages=[{'role': 'user', 'content': prompt}],
            options={'temperature': 0.2, 'timeout': 60}
        )

        assessment = response['message']['content'].strip()
        print("Parsing Accuracy Assessment:")
        print(assessment)

        # Save assessment
        with open("parsing_accuracy_assessment.txt", 'w', encoding='utf-8') as f:
            f.write(assessment)

        print("Assessment saved to parsing_accuracy_assessment.txt")

    except Exception as e:
        print(f"Parsing evaluation failed: {e}")

if __name__ == "__main__":
    test_evaluation_only()