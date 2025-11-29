# Mode 2: Visual Question Analysis System

## Overview

Mode 2 extends the AI Exam Evaluator with visual question processing capabilities. It can analyze question papers containing:

- **Visual diagrams and charts** (counting objects, analyzing shapes, etc.)  
- **Multiple Choice Questions (MCQ)** with options a,b,c,d or i,ii,iii,iv
- **Fill-in-the-blank questions** with visual context
- **Mixed question formats** with both text and visual elements

## Key Features

### 🎯 Visual Recognition
- Detects and analyzes diagrams, charts, images, and mathematical figures
- Counts objects (lollipops, mangoes, shapes, etc.)
- Recognizes geometric patterns and relationships

### 📝 Question Detection  
- Automatically finds questions numbered as: Q1, Q2, Q3 or 1, 2, 3
- Segments question regions for individual analysis
- Handles various question numbering formats

### 🔤 MCQ Processing
- Detects answer options: a,b,c,d or i,ii,iii,iv
- Analyzes each option in context
- Provides reasoned answer selection

### 🧠 AI-Powered Reasoning
- Uses Qwen 2 VL Instruct 2B for visual understanding
- Provides detailed reasoning for each answer
- Includes confidence scores (1-10 scale)

## Architecture

```
Frontend (React)
├── Mode Selector (Text/Visual)
├── VisualUploadForm.jsx
└── VisualResults.jsx

Backend (FastAPI)
├── /process_visual endpoint
├── VisualQuestionAgent
└── Qwen 2 VL Integration
```

## Usage

### Starting the System

1. **Backend** (from backend folder):
   ```powershell
   & "A:/progash/yeppa dei/ocr/.venv/Scripts/Activate.ps1"
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend** (from frontend folder):
   ```powershell
   npm run dev
   ```

### Using Mode 2

1. **Switch to Visual Mode**: Click "Visual Questions" in the header
2. **Upload**: Drag & drop or select a visual question paper (JPG, PNG, PDF)
3. **Process**: Click "Analyze Visual Questions" 
4. **Review Results**: Get detailed analysis with answers and reasoning

## API Endpoints

### POST /process_visual
Process visual question papers with AI analysis.

**Request:**
- `file`: Image or PDF file containing visual questions

**Response:**
```json
{
  "status": "success",
  "total_questions": 3,
  "questions": {
    "Q1": {
      "analysis": {
        "visual_description": "Image shows 3 mangoes in a basket",
        "question_text": "How many mangoes are in the basket?",
        "question_type": "mcq",
        "options": {
          "a": "2 mangoes",
          "b": "3 mangoes", 
          "c": "4 mangoes",
          "d": "5 mangoes"
        },
        "answer": "b",
        "reasoning": "By counting the visible mangoes in the basket, there are clearly 3 mangoes present.",
        "confidence": 9
      }
    }
  },
  "full_image_analysis": "Overall paper analysis...",
  "timestamp": "2025-10-28T..."
}
```

## Testing

Run the Mode 2 test suite:

```powershell
python test_mode2_visual.py
```

This will:
- Test visual question agent initialization  
- Verify processing functions
- Create a sample visual question
- Optionally test processing (requires GPU)

## Configuration

### Model Settings
- **Model**: Qwen/Qwen2-VL-2B-Instruct (2B parameters)
- **Device**: CUDA GPU required
- **Memory**: ~4GB GPU memory recommended

### Processing Options
- **Image formats**: JPG, PNG  
- **PDF support**: Converts first page to image
- **Max questions**: Up to 20 per paper
- **Confidence threshold**: Configurable (default: minimum 6/10)

## File Structure

```
backend/app/agents/
└── visual_question_agent.py     # Main visual processing agent

frontend/src/components/
├── VisualUploadForm.jsx         # Mode 2 upload interface
└── VisualResults.jsx            # Mode 2 results display

root/
├── test_mode2_visual.py         # Test suite for Mode 2
└── raw_things/                  # Stores processing results
    └── visual_analysis_*.json   # Individual analysis results
```

## Error Handling

The system includes comprehensive error handling:

- **GPU unavailable**: Clear error message with requirements
- **Model loading fails**: Fallback with specific error details  
- **Processing errors**: Per-question error tracking
- **Invalid files**: Format validation with helpful messages

## Example Visual Questions

Mode 2 can handle questions like:

1. **Counting**: "How many lollipops are in the image?"
2. **Shape analysis**: "What geometric shape is shown?"
3. **Comparison**: "Which basket has more apples?"
4. **Pattern recognition**: "Complete the pattern sequence"

## Performance Notes

- **Cold start**: First request takes longer (model loading)
- **GPU memory**: Automatically cleared after processing
- **Concurrent requests**: Limited by GPU memory
- **Processing time**: ~5-30 seconds per question paper

## Troubleshooting

### Common Issues

1. **"CUDA GPU required"**: Install CUDA-compatible PyTorch
2. **Model download fails**: Check internet connection and HuggingFace access
3. **Out of memory**: Reduce image size or restart backend
4. **Questions not detected**: Try clearer image or different numbering format

### Debug Mode

Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

Planned improvements for Mode 2:

- [ ] Better question detection algorithms
- [ ] Support for more option formats (A,B,C,D etc.)
- [ ] Batch processing of multiple papers
- [ ] Custom model fine-tuning options
- [ ] Integration with grading rubrics

## Dependencies

### Backend
- `transformers>=4.35.0` - Hugging Face transformers
- `torch>=2.0.0` - PyTorch with CUDA support  
- `pillow>=10.0.0` - Image processing
- `opencv-python>=4.8.0` - Computer vision
- `numpy>=1.21.0` - Numerical operations

### Frontend  
- `react` - UI framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `axios` - HTTP client

## Contributing

When adding new features to Mode 2:

1. Update the `VisualQuestionAgent` class
2. Add corresponding frontend components
3. Update API documentation
4. Add tests to `test_mode2_visual.py`
5. Update this README