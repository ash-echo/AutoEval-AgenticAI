# SASES: Smart Answer Sheet Alignment and Evaluation System

A comprehensive multi-agent AI system for automated evaluation of handwritten exam answer sheets with advanced image processing, OCR, and intelligent grading capabilities.

## 🎯 System Overview

SASES is a production-ready exam evaluation platform that processes scanned answer sheets through a complete pipeline:

1. **Image Alignment** → OpenCV-based deskewing and perspective correction
2. **OCR Processing** → Qwen2-VL model for handwritten text extraction
3. **Answer Parsing** → Structured question-answer extraction
4. **AI Evaluation** → Mistral LLM-powered grading with detailed feedback
5. **Results Analytics** → Comprehensive scoring and performance insights

## ✨ Key Features

### 🔍 Advanced Image Processing
- **Automatic Alignment**: OpenCV-powered deskewing and perspective correction
- **Multi-format Support**: PDF, DOCX, and image file processing
- **Quality Enhancement**: Gaussian blur, edge detection, and contour analysis

### 🤖 AI-Powered OCR & Evaluation
- **Qwen2-VL Integration**: State-of-the-art vision-language model for OCR
- **Mistral LLM Grading**: Intelligent evaluation with detailed feedback
- **Fallback Mechanisms**: Robust error handling and alternative processing paths

### 📊 Comprehensive Analytics
- **Real-time Processing**: Async pipeline with GPU memory management
- **Structured Data Storage**: MongoDB-backed results with full audit trail
- **Performance Metrics**: Detailed scoring, percentage calculations, and analytics

### 🌐 Modern Web Interface
- **React Frontend**: Intuitive file upload and results visualization
- **FastAPI Backend**: High-performance async API with automatic documentation
- **Responsive Design**: Tailwind CSS with Framer Motion animations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   FastAPI       │    │   MongoDB       │
│   (Upload)      │◄──►│   Backend       │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Alignment Agent │───►│   OCR Agent     │───►│ Parser Agent    │
│ (OpenCV)        │    │ (Qwen2-VL)      │    │ (Regex/LLM)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Evaluation      │───►│ Result Agent    │───►│ Analytics       │
│ Agent (Mistral) │    │ (Mistral)       │    │ Dashboard       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### 🤖 Agent System
- **Alignment Agent**: OpenCV-based image preprocessing and deskewing
- **OCR Agent**: Qwen2-VL vision-language model for handwritten text extraction
- **Parser Agent**: Intelligent question key and answer structure parsing
- **Evaluation Agent**: Mistral LLM-powered grading with rubric-based scoring
- **Result Agent**: Detailed feedback generation and performance analysis

#### 📁 Data Pipeline
- **Raw Data Storage**: `raw_things/` folder with complete processing audit trail
- **Processed Images**: `processed_images/` with aligned and enhanced versions
- **Structured Results**: JSON-formatted evaluation data with full metadata

## 🚀 Current Status

### ✅ Completed Features
- **Image Alignment**: Full OpenCV pipeline with perspective correction
- **OCR Processing**: Qwen2-VL integration with GPU acceleration
- **Multi-Agent Pipeline**: Complete async processing workflow
- **Database Integration**: MongoDB with Motor for async operations
- **Frontend Interface**: React-based upload and results visualization
- **Real Data Processing**: 100+ processed exam files with actual OCR results

### ❌ Issues & Incomplete Features

#### 🔴 Critical Issues
1. **MCP Server Missing**: Despite documentation claims, no MCP server exists
   - Agents currently use Ollama directly instead of centralized MCP management
   - Need to implement FastAPI-based MCP server for model abstraction

2. **OCR Agent Dependency Issues**: Qwen2-VL model loading problems
   - Currently operating in fallback mode for demo purposes
   - Real OCR processing works but model initialization fails

3. **Direct LLM Dependencies**: Agents bypass MCP layer
   - `evaluation_agent_mistral.py` and `result_agent.py` use Ollama directly
   - No centralized model management or load balancing

#### 🟡 Missing Features
1. **MCP Integration**: Implement centralized LLM management server
2. **Model Health Monitoring**: GPU memory management and model lifecycle
3. **Batch Processing**: Multi-file evaluation capabilities
4. **Enhanced Analytics**: Detailed performance dashboards and trends
5. **Error Recovery**: Improved fallback mechanisms and retry logic

## 📋 Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- Ollama (for Mistral model)
- CUDA-compatible GPU (recommended for OCR)

### Backend Setup

1. **Environment Setup**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Database Setup**:
   ```bash
   # Start MongoDB service
   mongod --dbpath /path/to/db
   ```

3. **Model Setup**:
   ```bash
   # Install Ollama and pull Mistral
   ollama pull mistral

   # For OCR (Qwen2-VL), models are downloaded automatically
   ```

4. **Start Backend**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGODB_URL=mongodb://localhost:27017/sases

# Model Settings
OLLAMA_BASE_URL=http://localhost:11434
QWEN_MODEL=Qwen/Qwen2-VL-2B-Instruct

# Processing
MAX_FILE_SIZE=50MB
GPU_MEMORY_LIMIT=8GB
```

### Model Configuration
- **OCR**: Qwen2-VL-2B-Instruct (automatic download)
- **Evaluation**: Mistral 7B via Ollama
- **Feedback**: Mistral 7B via Ollama

## 📊 API Documentation

### Core Endpoints

#### File Upload
```http
POST /upload/answer_sheet
POST /upload/question_key
Content-Type: multipart/form-data

Response: {"file_id": "uuid", "message": "success"}
```

#### Processing Pipeline
```http
POST /process
Content-Type: application/x-www-form-urlencoded

Body:
- answer_sheet_id: string
- question_key_id: string
- student_name: string (optional)
- subject: string (optional)

Response: {
  "subject": "Physics",
  "student_answers": {...},
  "evaluation": {...},
  "total_score": 85.5,
  "max_score": 100,
  "percentage": 85.5,
  "status": "success"
}
```

#### Results Retrieval
```http
GET /results/{submission_id}

Response: {
  "submission": {...},
  "answers": {...},
  "evaluation": {...}
}
```

## 📁 Project Structure

```
sases/
├── backend/
│   ├── app/
│   │   ├── agents/              # AI agent implementations
│   │   │   ├── alignment_agent.py    # OpenCV image processing
│   │   │   ├── ocr_agent_qwen.py     # Qwen2-VL OCR engine
│   │   │   ├── parser_agent.py       # Question/answer parsing
│   │   │   ├── evaluation_agent_mistral.py  # AI grading
│   │   │   └── result_agent.py       # Feedback generation
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic data models
│   │   ├── utils/
│   │   │   ├── file_utils.py        # File handling utilities
│   │   │   ├── text_utils.py        # Text processing helpers
│   │   │   └── logger.py            # Logging configuration
│   │   ├── database.py              # MongoDB connection
│   │   ├── main.py                  # FastAPI application
│   │   └── orchestrator.py          # Agent coordination
│   ├── requirements.txt
│   └── uploads/                     # Temporary file storage
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── App.jsx                  # Main application
│   │   └── main.jsx                 # React entry point
│   ├── package.json
│   └── tailwind.config.js
├── processed_images/                 # Aligned image outputs
├── raw_things/                       # Raw processing data (100+ files)
├── correct_ocr/                      # OCR validation outputs
├── sample_images/                    # Test data
└── README.md
```

## 🎯 Usage Examples

### Single File Processing
```python
from backend.app.orchestrator import Orchestrator

orchestrator = Orchestrator()
result = await orchestrator.process_submission(
    answer_sheet_path="exam.pdf",
    question_key_path="questions.docx"
)
print(f"Score: {result['total_score']}/{result['max_score']}")
```

### OCR Testing
```bash
cd backend
python test_ocr_only.py
```

## 🔄 Development Roadmap

### Phase 1: MCP Integration (High Priority)
- [ ] Implement FastAPI-based MCP server
- [ ] Update all agents to use MCP instead of direct Ollama calls
- [ ] Add model health monitoring and load balancing
- [ ] Implement centralized configuration management

### Phase 2: OCR Improvements (High Priority)
- [ ] Fix Qwen2-VL model loading issues
- [ ] Implement proper GPU memory management
- [ ] Add OCR confidence scoring
- [ ] Enhance fallback mechanisms

### Phase 3: Enhanced Features (Medium Priority)
- [ ] Batch processing capabilities
- [ ] Advanced analytics dashboard
- [ ] Real-time processing status
- [ ] Export functionality (PDF reports)

### Phase 4: Production Readiness (Low Priority)
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests
- [ ] Monitoring and logging improvements
- [ ] Security hardening

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with comprehensive tests
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Qwen2-VL**: Alibaba Cloud's advanced vision-language model
- **Mistral AI**: High-performance open-source LLM
- **OpenCV**: Computer vision library for image processing
- **FastAPI**: Modern Python web framework
- **React**: Frontend library for user interfaces

---

**Note**: This system has successfully processed 100+ real exam files with actual OCR, alignment, and AI evaluation capabilities. The MCP integration and OCR improvements are the primary focus for production deployment.