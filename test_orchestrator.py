import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.orchestrator import Orchestrator

async def test_orchestrator():
    # Test with the uploaded files - use actual files from uploads directory
    answer_sheet = r"A:\progash\gg\ans phy.pdf"
    question_key = r"A:\progash\ocr\backend\uploads\d763d97b-be18-429d-8441-06be04d19205_question_key.pdf"

    print(f"Testing with files:")
    print(f"Answer sheet: {answer_sheet}")
    print(f"Question key: {question_key}")

    try:
        orchestrator = Orchestrator()
        result = await orchestrator.process_submission(answer_sheet, question_key)
        print("✅ Processing successful!")
        print(f"Result: {result}")
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_orchestrator())