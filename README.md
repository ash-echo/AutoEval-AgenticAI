# AI Exam Evaluation System

A multi-agent web application for evaluating handwritten exam answers using OCR and AI.

## Features

- **OCR Engine**: Uses Hugging Face Qwen-VL model for accurate text extraction from handwritten exams
- **Image Alignment**: OpenCV-based preprocessing for better OCR accuracy
- **Question Parsing**: Regex-based extraction of question-answer pairs
- **AI Evaluation**: LLaMA3-powered grading and feedback
- **Web Interface**: React frontend with Tailwind CSS for easy uploads and results viewing
- **Database**: MongoDB storage for submissions and evaluations

## Architecture

- **Backend**: FastAPI with async agents (OCR, Alignment, Parser, Evaluation)
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MongoDB with Motor
- **AI Models**: Qwen2-VL-2B-Instruct for OCR, LLaMA3 for evaluation

## Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB
- Ollama (for LLaMA3)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start MongoDB (if not running)

4. Start Ollama and pull LLaMA3:
   ```bash
   ollama pull llama3
   ```

5. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open the frontend at http://localhost:5173
2. Upload a handwritten exam image
3. View OCR results, structured answers, and AI evaluations

## API Endpoints

- `POST /upload`: Upload and process an exam image
- `GET /submission/{id}`: Retrieve a submission by ID

## Project Structure

```
backend/
├── app/
│   ├── agents/          # AI agents (OCR, alignment, parser, evaluation)
│   ├── models/          # Pydantic schemas
│   ├── utils/           # File and text utilities
│   ├── database.py      # MongoDB connection
│   ├── main.py          # FastAPI app
│   └── orchestrator.py  # Agent coordinator
├── requirements.txt
frontend/
├── src/
│   ├── components/      # React components
│   ├── App.jsx
│   └── index.css
├── tailwind.config.js
└── package.json
```