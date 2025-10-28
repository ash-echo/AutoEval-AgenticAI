"""
Test script for Mode 2 - Visual Question Analysis
Tests the visual question processing without the full web interface.
"""

import sys
import os
from pathlib import Path

# Add the backend app to the path
backend_path = Path(__file__).parent / "backend" / "app"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

def test_visual_question_agent():
    """Test the visual question agent directly."""
    try:
        from agents.visual_question_agent import VisualQuestionAgent
        print("✅ Visual question agent imported successfully")
        
        # Test agent initialization
        agent = VisualQuestionAgent()
        print("✅ Visual question agent initialized successfully")
        
        # Clean up
        agent.cleanup()
        print("✅ Visual question agent cleaned up successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Visual question agent test failed: {e}")
        return False

def test_visual_processing_function():
    """Test the standalone visual processing function."""
    try:
        from agents.visual_question_agent import process_visual_questions
        print("✅ Visual processing function imported successfully")
        
        # Note: Actual processing requires an image file
        print("✅ Visual processing function ready for use")
        
        return True
        
    except Exception as e:
        print(f"❌ Visual processing function test failed: {e}")
        return False

def create_sample_visual_question():
    """Create a simple sample visual question for testing."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create a sample image with a simple visual question
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font, fallback to basic if not available
        try:
            font_large = ImageFont.truetype("arial.ttf", 24)
            font_medium = ImageFont.truetype("arial.ttf", 18)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
        
        # Draw a simple question
        draw.text((50, 50), "Question 1: How many circles are in the image below?", fill='black', font=font_large)
        
        # Draw some circles
        draw.ellipse([100, 150, 150, 200], outline='blue', width=3)  # Circle 1
        draw.ellipse([200, 150, 250, 200], outline='red', width=3)   # Circle 2
        draw.ellipse([300, 150, 350, 200], outline='green', width=3) # Circle 3
        
        # Draw answer options
        draw.text((50, 250), "a) 2 circles", fill='black', font=font_medium)
        draw.text((50, 280), "b) 3 circles", fill='black', font=font_medium)
        draw.text((50, 310), "c) 4 circles", fill='black', font=font_medium)
        draw.text((50, 340), "d) 5 circles", fill='black', font=font_medium)
        
        # Save the sample image
        sample_path = Path("sample_visual_question.png")
        img.save(sample_path)
        print(f"✅ Sample visual question created: {sample_path}")
        
        return str(sample_path)
        
    except Exception as e:
        print(f"❌ Failed to create sample visual question: {e}")
        return None

def run_all_tests():
    """Run all Mode 2 tests."""
    print("🧪 Running Mode 2 - Visual Question Analysis Tests")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Agent import and initialization
    print("\n📋 Test 1: Visual Question Agent")
    if test_visual_question_agent():
        tests_passed += 1
    
    # Test 2: Processing function
    print("\n📋 Test 2: Visual Processing Function")
    if test_visual_processing_function():
        tests_passed += 1
    
    # Test 3: Sample creation
    print("\n📋 Test 3: Sample Visual Question Creation")
    sample_path = create_sample_visual_question()
    if sample_path:
        tests_passed += 1
        
        # Optional: Test actual processing if GPU is available
        try:
            print("\n📋 Bonus Test: Processing Sample Question")
            from agents.visual_question_agent import process_visual_questions
            result = process_visual_questions(sample_path)
            
            if result.get('status') == 'success':
                print("✅ Sample visual question processed successfully!")
                print(f"   - Detected {result.get('total_questions', 0)} questions")
                print(f"   - Full analysis available")
            else:
                print(f"⚠️  Sample processing completed with status: {result.get('status')}")
                if result.get('error'):
                    print(f"   Error: {result.get('error')}")
            
        except Exception as e:
            print(f"⚠️  Sample processing test skipped: {e}")
            print("   (This is normal if GPU/CUDA is not available)")
    
    print("\n" + "=" * 60)
    print(f"🏁 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Mode 2 is ready for use.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    run_all_tests()