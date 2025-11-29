import React, { useRef, useEffect, useState, forwardRef } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import TextPressure from './TextPressure';
import VariableProximity from './VariableProximity';
import LightRays from './LightRays';
import TargetCursor from './TargetCursor';
import DotGrid from './DotGrid';
import RotatingText from './RotatingText';
import MagicBento from "./MagicBento";
import TextType from "./TextType";
import Counter from "./counter";
import Aurora from "./Aurora";
import './App.css';

// Configure PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const Hero = forwardRef((props, ref) => {
  const containerRef = useRef(null);

  return (
    <section id="hero" className="section hero" ref={ref}>
      <div className="hero-background">
        <LightRays
          raysOrigin="top-center"
          raysColor="#B57EDC"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="hero-light-rays"
        />
      </div>
      
      <div className="hero-content" ref={containerRef}>
        <div className="hero-text-container">
          <TextPressure
            text="GradeX"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#ffffff"
            strokeColor="#B57EDC"
            minFontSize={48}
          />
        </div>
        
        <div className="hero-bottom-content">
          <div className="hero-buttons">
            <button className="btn btn-minimal cursor-target">
              <span className="button-text">Try Demo</span>
              <span className="button-glare"></span>
            </button>
            <button className="btn btn-minimal cursor-target">
              <span className="button-text">Learn More</span>
              <span className="button-glare"></span>
            </button>
          </div>
          
          <div className="hero-subtitle-container">
            <VariableProximity
              label="Revolutionizing Academic Assessment with AI"
              className="hero-subtitle"
              fromFontVariationSettings="'wght' 400, 'opsz' 16"
              toFontVariationSettings="'wght' 800, 'opsz' 24"
              containerRef={containerRef}
              radius={150}
              falloff="linear"
            />
          </div>
        </div>
      </div>
      
      <div className="hero-scroll-indicator">
        <div className="scroll-indicator-dot"></div>
      </div>
    </section>
  );
});

const WhatIsGradeX = forwardRef((props, ref) => {
  return (
    <section id="what-is-gradex" className="section what-is-gradex" ref={ref}>
      <div className="dot-grid-container">
        <DotGrid
          dotSize={8}
          gap={35}
          baseColor="#2D1B69"
          activeColor="#B57EDC"
          proximity={180}
          shockRadius={350}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      
      <div className="rotating-text-top-right">
        <span className="static-prefix">GradeX</span>
        <RotatingText
          texts={['Faster.', 'Fairer.', 'Smarter.']}
          mainClassName="rotating-text-large"
          staggerFrom={"last"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
      </div>
      
      <div className="what-is-content">
        <div className="magic-bento-container">
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="181, 126, 220"
          />
        </div>
      </div>
    </section>
  );
});

const LiveDemo = forwardRef((props, ref) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('forward');
  const [stepsVisible, setStepsVisible] = useState(true);
  const [cursorKey, setCursorKey] = useState(0);
  
  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [pdfCount, setPdfCount] = useState(1);
  const [studentName, setStudentName] = useState('');
  
  // File states
  const [rubricFile, setRubricFile] = useState(null);
  const [questionPaperFile, setQuestionPaperFile] = useState(null);
  const [answerSheetFile, setAnswerSheetFile] = useState(null);
  const [answerSheetPreview, setAnswerSheetPreview] = useState(null);
  
  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  const handleFileUpload = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      switch(fileType) {
        case 'rubric':
          setRubricFile(file);
          break;
        case 'question':
          setQuestionPaperFile(file);
          break;
        case 'answer':
          if (file.type === 'application/pdf') {
            setAnswerSheetFile(file);
            // Create preview URL for the PDF
            const fileURL = URL.createObjectURL(file);
            setAnswerSheetPreview(fileURL);
          } else {
            alert('Please upload a PDF file for the answer sheet');
          }
          break;
      }
    }
  };

  const handleProcessFile = () => {
    setIsProcessing(true);
    setCursorKey(prev => prev + 1);
    
    // Simulate processing
    setTimeout(() => {
      // Generate mock question analysis data
      const questionAnalysis = [
        {
          id: 1,
          question: "Explain the concept of machine learning and its applications in modern technology.",
          obtainedMarks: 8,
          totalMarks: 10,
          expectedAnswer: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It involves algorithms that identify patterns in data and make decisions with minimal human intervention.",
          studentAnswer: "Machine learning is when computers learn from data. It's used in things like recommendation systems and self-driving cars. The algorithms find patterns in the data.",
          keywords: {
            expected: ["algorithms", "patterns", "data", "decisions", "experience"],
            matched: ["algorithms", "data", "patterns"]
          },
          feedback: "Good explanation of machine learning concepts with relevant examples. Could improve by discussing more recent applications and limitations."
        },
        {
          id: 2,
          question: "Compare and contrast supervised and unsupervised learning algorithms.",
          obtainedMarks: 7,
          totalMarks: 10,
          expectedAnswer: "Supervised learning uses labeled data to train models, with clear input-output pairs. Unsupervised learning works with unlabeled data to find hidden patterns. Supervised learning is used for classification and regression, while unsupervised is used for clustering and association.",
          studentAnswer: "Supervised learning uses labeled data and unsupervised doesn't. Supervised is for classification and unsupervised is for finding patterns.",
          keywords: {
            expected: ["labeled data", "unlabeled data", "classification", "clustering", "patterns"],
            matched: ["labeled data", "classification", "patterns"]
          },
          feedback: "Clear comparison between the two approaches. Consider adding more specific algorithm examples and their use cases."
        },
        {
          id: 3,
          question: "Describe the process of data preprocessing in machine learning pipelines.",
          obtainedMarks: 9,
          totalMarks: 10,
          expectedAnswer: "Data preprocessing involves cleaning, transforming, and preparing raw data for machine learning models. Key steps include handling missing values, normalizing features, encoding categorical variables, feature selection, and data splitting.",
          studentAnswer: "Data preprocessing is about cleaning and preparing data. You need to handle missing values, normalize features, encode categorical variables, and split the data into training and testing sets.",
          keywords: {
            expected: ["cleaning", "missing values", "normalization", "encoding", "feature selection"],
            matched: ["missing values", "normalization", "encoding", "feature selection"]
          },
          feedback: "Excellent coverage of preprocessing techniques. Well-structured explanation with practical considerations."
        },
        {
          id: 4,
          question: "What are the ethical considerations in AI development?",
          obtainedMarks: 6,
          totalMarks: 10,
          expectedAnswer: "Ethical considerations in AI include bias in algorithms, transparency and explainability, privacy concerns, accountability for AI decisions, job displacement, and ensuring fairness across different demographic groups.",
          studentAnswer: "AI ethics involves making sure AI is fair and doesn't discriminate. Privacy is important, and we need to know how AI makes decisions.",
          keywords: {
            expected: ["bias", "transparency", "privacy", "accountability", "fairness"],
            matched: ["privacy", "fairness"]
          },
          feedback: "Some valid points raised but needs more depth. Consider discussing bias, transparency, and accountability in more detail."
        },
        {
          id: 5,
          question: "Design a simple neural network architecture for image classification.",
          obtainedMarks: 8,
          totalMarks: 10,
          expectedAnswer: "A simple CNN for image classification would include input layer, convolutional layers with ReLU activation, pooling layers for dimensionality reduction, fully connected layers, and output layer with softmax activation. Common architectures use multiple convolutional-pooling pairs followed by dense layers.",
          studentAnswer: "For image classification, I'd use a CNN with input layer, convolutional layers with ReLU, pooling layers, fully connected layers, and a softmax output layer. Multiple conv-pool pairs work well.",
          keywords: {
            expected: ["CNN", "convolutional", "pooling", "ReLU", "softmax"],
            matched: ["CNN", "convolutional", "pooling", "ReLU", "softmax"]
          },
          feedback: "Good architectural design with clear reasoning. Could benefit from discussing hyperparameter tuning and optimization techniques."
        }
      ];
      
      const totalScore = questionAnalysis.reduce((sum, q) => sum + q.obtainedMarks, 0);
      const maxScore = questionAnalysis.reduce((sum, q) => sum + q.totalMarks, 0);
      const percentageScore = Math.round((totalScore / maxScore) * 100);
      
      const result = {
        score: percentageScore,
        feedback: "Good analysis of the topic with clear examples. Consider adding more supporting evidence for your main arguments.",
        timeSpent: `${Math.floor(Math.random() * 5) + 2} seconds`,
        studentName: studentName || "Alex Johnson",
        subject: subjectName || "Computer Science",
        questionAnalysis: questionAnalysis,
        detailedScores: {
          content: 92,
          structure: 90,
          grammar: 80,
          creativity: 88,
          research: 81
        },
        strengths: [
          "Clear thesis statement",
          "Well-organized paragraphs",
          "Good use of examples"
        ],
        improvements: [
          "Add more citations",
          "Strengthen conclusion",
          "Expand on counterarguments"
        ]
      };
      
      setProcessingResult(result);
      setIsProcessing(false);
      setProcessingComplete(true);
      
      // Navigate to processing visualization section after processing
      setTimeout(() => {
        props.onNavigateToProcessing(result, answerSheetPreview, answerSheetFile);
      }, 1500);
    }, 3000);
  };

  const handleReset = () => {
    setCursorKey(prev => prev + 1);
    
    setSubjectName('');
    setPdfCount(1);
    setStudentName('');
    setRubricFile(null);
    setQuestionPaperFile(null);
    setAnswerSheetFile(null);
    setProcessingResult(null);
    setConfirmed(false);
    setIsProcessing(false);
    setCurrentStep(1);
    setStepsVisible(true);
    setProcessingComplete(false);
    
    setTimeout(() => {
      setCursorKey(prev => prev + 1);
    }, 100);
  };

  const removeFile = (fileType) => {
    switch(fileType) {
      case 'rubric':
        setRubricFile(null);
        break;
      case 'question':
        setQuestionPaperFile(null);
        break;
      case 'answer':
        setAnswerSheetFile(null);
        break;
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setIsTransitioning(true);
      setAnimationDirection('forward');
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setAnimationDirection('backward');
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const renderStep = () => {
    const stepContent = (
      <div className={`step-content ${isTransitioning ? 'transitioning' : ''} ${animationDirection}`}>
        {currentStep === 1 && (
          <>
            <h3>Welcome to GradeX</h3>
            <p>Experience the future of academic assessment with our AI-powered grading system</p>
            <div className="welcome-features">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h4>Lightning Fast</h4>
                <p>Grade documents in seconds, not hours</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h4>Precise Analysis</h4>
                <p>AI-driven evaluation with consistent results</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Detailed Reports</h4>
                <p>Comprehensive feedback for improvement</p>
              </div>
            </div>
          </>
        )}
        
        {currentStep === 2 && (
          <>
            <h3>Enter Details</h3>
            <div className="input-group animated-input">
              <label htmlFor="subject-name">Subject Name</label>
              <input
                type="text"
                id="subject-name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g., Computer Science 101"
                className="demo-input"
              />
              <div className="input-underline"></div>
            </div>
            <div className="input-group animated-input">
              <label htmlFor="pdf-count">Number of PDFs to Upload</label>
              <div className="pdf-counter-container">
                <div className="pdf-counter-label">PDFs</div>
                <div className="pdf-counter-controls">
                  <button
                    className="pdf-counter-button cursor-target pulse-hover"
                    onClick={() => setPdfCount(Math.max(1, pdfCount - 1))}
                    disabled={pdfCount <= 1}
                  >
                    -
                  </button>
                  <div className="pdf-counter-value">
                    <Counter
                      value={pdfCount}
                      places={[10, 1]}
                      fontSize={40}
                      padding={5}
                      gap={2}
                      textColor="#B57EDC"
                      fontWeight={900}
                      gradientHeight={0}
                      gradientFrom="transparent"
                      gradientTo="transparent"
                      backgroundColor="transparent"
                    />
                  </div>
                  <button
                    className="pdf-counter-button cursor-target pulse-hover"
                    onClick={() => setPdfCount(Math.min(10, pdfCount + 1))}
                    disabled={pdfCount >= 10}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="input-group animated-input">
              <label htmlFor="student-name">Student Name</label>
              <input
                type="text"
                id="student-name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                className="demo-input"
              />
              <div className="input-underline"></div>
            </div>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <h3>Upload Reference Documents</h3>
            <div className="file-upload-group">
              <div className="file-upload-container animated-upload">
                <input
                  type="file"
                  accept=".pdf,.doc,.doc,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'rubric')}
                  className="file-input"
                  id="rubric-upload"
                />
                <label htmlFor="rubric-upload" className="file-upload-label">
                  <div className="upload-icon">📋</div>
                  <span className="upload-text">
                    {rubricFile ? rubricFile.name : "Upload Rubric"}
                  </span>
                  <span className="upload-subtext">PDF, DOC, DOCX</span>
                </label>
                {rubricFile && (
                  <div className="file-info slide-in">
                    <div className="file-details">
                      <span className="file-name">{rubricFile.name}</span>
                      <span className="file-size">
                        {(rubricFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button 
                      className="remove-file scale-hover cursor-target" 
                      onClick={() => removeFile('rubric')}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <div className="file-upload-container animated-upload">
                <input
                  type="file"
                  accept=".pdf,.doc,.doc,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'question')}
                  className="file-input"
                  id="question-upload"
                />
                <label htmlFor="question-upload" className="file-upload-label">
                  <div className="upload-icon">📝</div>
                  <span className="upload-text">
                    {questionPaperFile ? questionPaperFile.name : "Upload Question Paper"}
                  </span>
                  <span className="upload-subtext">PDF, DOC, DOCX</span>
                </label>
                {questionPaperFile && (
                  <div className="file-info slide-in">
                    <div className="file-details">
                      <span className="file-name">{questionPaperFile.name}</span>
                      <span className="file-size">
                        {(questionPaperFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button 
                      className="remove-file scale-hover cursor-target" 
                      onClick={() => removeFile('question')}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {currentStep === 4 && (
          <>
            <h3>Upload Answer Sheet</h3>
            <div className="file-upload-container animated-upload">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileUpload(e, 'answer')}
                className="file-input"
                id="answer-upload"
              />
              <label htmlFor="answer-upload" className="file-upload-label">
                <div className="upload-icon">📄</div>
                <span className="upload-text">
                  {answerSheetFile ? answerSheetFile.name : "Upload Answer Sheet (PDF)"}
                </span>
                <span className="upload-subtext">PDF files only</span>
              </label>
            </div>
            
            {answerSheetFile && (
              <div className="file-info slide-in">
                <div className="file-details">
                  <span className="file-name">{answerSheetFile.name}</span>
                  <span className="file-size">
                    {(answerSheetFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button 
                  className="remove-file scale-hover cursor-target" 
                  onClick={() => removeFile('answer')}
                >
                  ×
                </button>
              </div>
            )}
          </>
        )}
        
        {currentStep === 5 && (
          <>
            <h3>Confirm Uploads</h3>
            <div className="confirmation-list animated-list">
              <div className="confirm-item fade-in" style={{animationDelay: '0.1s'}}>
                <span className="confirm-label">Subject:</span>
                <span className="confirm-value">{subjectName || 'Not specified'}</span>
              </div>
              <div className="confirm-item fade-in" style={{animationDelay: '0.2s'}}>
                <span className="confirm-label">Student:</span>
                <span className="confirm-value">{studentName || 'Not specified'}</span>
              </div>
              <div className="confirm-item fade-in" style={{animationDelay: '0.3s'}}>
                <span className="confirm-label">Number of PDFs:</span>
                <span className="confirm-value">{pdfCount}</span>
              </div>
              <div className="confirm-item fade-in" style={{animationDelay: '0.4s'}}>
                <span className="confirm-label">Rubric:</span>
                <span className="confirm-value">{rubricFile ? rubricFile.name : 'Not uploaded'}</span>
              </div>
              <div className="confirm-item fade-in" style={{animationDelay: '0.5s'}}>
                <span className="confirm-label">Question Paper:</span>
                <span className="confirm-value">{questionPaperFile ? questionPaperFile.name : 'Not uploaded'}</span>
              </div>
              <div className="confirm-item fade-in" style={{animationDelay: '0.6s'}}>
                <span className="confirm-label">Answer Sheet:</span>
                <span className="confirm-value">{answerSheetFile ? answerSheetFile.name : 'Not uploaded'}</span>
              </div>
            </div>
            <div className="confirmation-checkbox animated-checkbox">
              <input
                type="checkbox"
                id="confirm-checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm-checkbox">I confirm all information is correct</label>
            </div>
          </>
        )}
        
        {currentStep === 6 && (
          <>
            {!isProcessing && !processingComplete && (
              <>
                <h3>Start Processing</h3>
                <p>Click below to begin AI analysis</p>
                <div className="process-trigger cursor-target glow-hover" onClick={handleProcessFile}>
                  <p>Start Processing</p>
                  <div className="process-particles"></div>
                </div>
              </>
            )}
            
            {isProcessing && (
              <>
                <h3>Processing Documents</h3>
                <div className="processing-animation">
                  <div className="processing-spinner enhanced"></div>
                  <p>Analyzing content...</p>
                  <div className="processing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </>
            )}
            
            {processingComplete && (
              <>
                <h3>Processing Complete!</h3>
                <div className="processing-complete-animation">
                  <div className="success-icon">✓</div>
                  <p>Navigating to results...</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );

    return stepContent;
  };

  return (
    <section id="live-demo" className="section live-demo" ref={ref}>
      <div className="aurora-background">
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          amplitude={1.0}
          blend={0.5}
          speed={0.5}
        />
      </div>
      
      <div className="demo-content">
        <div className="demo-header">
          <TextType 
            text={["Live Demo", "Try It Yourself", "MVP"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="demo-title"
          />
        </div>
        
        <div className="stepper-wrapper">
          <div className={`stepper-container ${stepsVisible ? '' : 'steps-hidden'}`}>
            {/* Step Indicators */}
            <div className={`step-indicators ${stepsVisible ? '' : 'fade-out'}`}>
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="step-indicator">
                  <div className={`step-circle ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
                    <span className="step-number">{step}</span>
                    <div className="step-ripple"></div>
                  </div>
                  <span className="step-label">
                    {step === 1 && 'Welcome'}
                    {step === 2 && 'Details'}
                    {step === 3 && 'References'}
                    {step === 4 && 'Answer Sheet'}
                    {step === 5 && 'Confirm'}
                    {step === 6 && 'Process'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress Line */}
            <div className={`progress-line ${stepsVisible ? '' : 'fade-out'}`}>
              <div className="progress-fill" style={{width: `${((currentStep - 1) / 5) * 100}%`}}></div>
            </div>
            
            {/* Step Content */}
            <div className="step-content-wrapper">
              {renderStep()}
            </div>
            
            {/* Navigation Buttons */}
            <div className={`step-navigation ${stepsVisible ? '' : 'fade-out'}`}>
              <button 
                className="nav-button prev-button cursor-target slide-hover" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <span className="button-icon">←</span>
                Previous
              </button>
              <button 
                className="nav-button next-button cursor-target slide-hover" 
                onClick={nextStep}
                disabled={currentStep === 6 || (currentStep === 5 && !confirmed)}
              >
                {currentStep === 5 ? 'Confirm' : 'Next'}
                <span className="button-icon">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const BackendVisualization = forwardRef((props, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ocrText, setOcrText] = useState('Initializing OCR...\n\n');
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const processDocument = async () => {
      if (!props.answerSheetFile) {
        setOcrText('No file uploaded');
        setIsProcessing(false);
        return;
      }

      try {
        setOcrText('Loading PDF document...\n\n');
        
        // Load PDF
        const arrayBuffer = await props.answerSheetFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        setTotalPages(numPages);
        
        let fullText = `Document loaded successfully!\nTotal pages: ${numPages}\n\n`;
        fullText += '='.repeat(50) + '\n\n';
        setOcrText(fullText);
        
        // Process each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          setProgress(Math.round((pageNum / numPages) * 100));
          fullText += `Processing Page ${pageNum}/${numPages}...\n`;
          setOcrText(fullText);
          
          // Get page
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          
          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Convert canvas to blob
          const blob = await new Promise(resolve => canvas.toBlob(resolve));
          
          // Perform OCR
          fullText += `Performing OCR on page ${pageNum}...\n`;
          setOcrText(fullText);
          
          const { data: { text } } = await Tesseract.recognize(
            blob,
            'eng',
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setProgress(Math.round(((pageNum - 1) / numPages + m.progress / numPages) * 100));
                }
              }
            }
          );
          
          // Add extracted text
          fullText += `\n${'='.repeat(50)}\n`;
          fullText += `PAGE ${pageNum} CONTENT:\n`;
          fullText += '='.repeat(50) + '\n\n';
          fullText += text.trim() + '\n\n';
          setOcrText(fullText);
        }
        
        fullText += '\n' + '='.repeat(50) + '\n';
        fullText += 'OCR Processing Complete!\n';
        fullText += '='.repeat(50) + '\n';
        setOcrText(fullText);
        setIsProcessing(false);
        
      } catch (error) {
        console.error('Error processing document:', error);
        setOcrText(`Error processing document: ${error.message}`);
        setIsProcessing(false);
      }
    };

    processDocument();
  }, [props.answerSheetFile]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleContinue = () => {
    props.onNavigateToResults();
  };

  return (
    <section id="backend-visualization" className="section backend-visualization" ref={ref}>
      <div className="visualization-container">
        <h1 className="visualization-title">Backend Process Visualization</h1>
        
        <div className="visualization-content">
          {/* Left Panel - Question Paper */}
          <div className="left-panel">
            <h2>Question paper</h2>
            <div className="paper-viewer">
              {props.pdfPreview ? (
                <iframe
                  src={`${props.pdfPreview}#page=${currentPage}`}
                  title="Question Paper"
                  className="pdf-preview"
                />
              ) : (
                <div className="placeholder-image">
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='20' font-family='Arial'%3EQuestion Paper Preview%3C/text%3E%3C/svg%3E"
                    alt="Question Paper"
                  />
                </div>
              )}
              <div className="page-controls">
                <button 
                  className="page-btn cursor-target" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button 
                  className="page-btn cursor-target" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - OCR Extracted Text */}
          <div className="right-panel">
            <h2>Extracted Text (OCR)</h2>
            {isProcessing && (
              <div className="ocr-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">{progress}% Complete</span>
              </div>
            )}
            <div className="thinking-content">
              <pre className="thinking-text">{ocrText}</pre>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="continue-section">
          <button 
            className="continue-btn cursor-target" 
            onClick={handleContinue}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Continue to Results →'}
          </button>
        </div>
      </div>
    </section>
  );
});

const Results = forwardRef((props, ref) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [cursorKey, setCursorKey] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
  }, []);

  const handleBackToDemo = () => {
    props.onBackToDemo();
  };

  const handleDownloadReport = () => {
    // Simulate download
    const link = document.createElement('a');
    link.download = `grade-report-${props.result.studentName}.pdf`;
    link.click();
  };

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    return 'F';
  };

  const getPerformanceBadge = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', color: '#4CAF50' };
    if (percentage >= 80) return { text: 'Good', color: '#8BC34A' };
    if (percentage >= 70) return { text: 'Satisfactory', color: '#FFC107' };
    if (percentage >= 60) return { text: 'Needs Improvement', color: '#FF9800' };
    return { text: 'Poor', color: '#F44336' };
  };

  // Calculate circumference for the SVG circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (props.result.score / 100) * circumference;

  return (
    <section id="results" className="section results no-cursor" ref={ref}>
      <div className="results-container">
        <div className="results-content">
          {/* Two-column grid layout */}
          <div className="results-grid">
            {/* Left Column - 30% */}
            <div className="results-left-column">
              {/* Circular Score Indicator */}
              <div className={`score-circle-container ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.2s'}}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#333"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={getScoreColor(props.result.score)}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text-overlay">
                  <div className="score-value" style={{color: getScoreColor(props.result.score)}}>
                    {props.result.score}
                  </div>
                  <div className="score-grade" style={{color: getScoreColor(props.result.score)}}>
                    {getGrade(props.result.score)}
                  </div>
                  <div className="score-qualitative" style={{color: getScoreColor(props.result.score)}}>
                    {props.result.score >= 70 ? 'good' : 'needs improvement'}
                  </div>
                </div>
              </div>
              
              {/* Student Metadata Panel */}
              <div className={`student-metadata-panel ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.4s'}}>
                <h3>Student Information</h3>
                <div className="metadata-item">
                  <span className="metadata-label">student id:</span>
                  <span className="metadata-value">STU-001</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">name:</span>
                  <span className="metadata-value">{props.result.studentName}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">subject:</span>
                  <span className="metadata-value">{props.result.subject}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">date:</span>
                  <span className="metadata-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Detailed Breakdown */}
              <div className={`detailed-breakdown-panel ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.6s'}}>
                <h3>Performance Breakdown</h3>
                <div className="breakdown-item">
                  <div className="breakdown-label">Content</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{width: `${props.result.detailedScores.content}%`, backgroundColor: '#66BB6A'}}
                    ></div>
                  </div>
                  <div className="breakdown-value">{props.result.detailedScores.content}%</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Grammar</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{width: `${props.result.detailedScores.grammar}%`, backgroundColor: '#4CAF50'}}
                    ></div>
                  </div>
                  <div className="breakdown-value">{props.result.detailedScores.grammar}%</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Accuracy</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{width: `${props.result.detailedScores.research}%`, backgroundColor: '#EF5350'}}
                    ></div>
                  </div>
                  <div className="breakdown-value">{props.result.detailedScores.research}%</div>
                </div>
              </div>
            </div>
            
            {/* Right Column - 70% */}
            <div className="results-right-column">
              {/* Question-wise Analysis */}
              <div className={`question-analysis-panel ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.3s'}}>
                <h3>Question-wise Analysis</h3>
                {props.result.questionAnalysis.map((q, index) => {
                  const percentage = Math.round((q.obtainedMarks / q.totalMarks) * 100);
                  const badge = getPerformanceBadge(percentage);
                  const isExpanded = expandedQuestions[q.id];
                  
                  return (
                    <div key={q.id} className={`question-item ${isExpanded ? 'expanded' : ''}`}>
                      <div className="question-header" onClick={() => toggleQuestionExpansion(q.id)}>
                        <div className="question-number">Q{q.id}</div>
                        <div className="question-score">
                          <span className="score-obtained">{q.obtainedMarks}</span>
                          <span className="score-separator">/</span>
                          <span className="score-total">{q.totalMarks}</span>
                          <span className="score-percentage">{percentage}%</span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="question-details">
                          <div className="question-text">{q.question}</div>
                          
                          {q.id === 2 && (
                            <div className="comparison-image">
                              <img src="q2-comparison.png" alt="Expected vs. Student Answer Comparison" />
                            </div>
                          )}
                          
                          <div className="keyword-tags">
                            <span className="tag-label">Keywords:</span>
                            {q.keywords.expected.map((keyword, i) => (
                              <span key={i} className="keyword-tag expected">{keyword}</span>
                            ))}
                          </div>
                          
                          <div className="question-feedback">
                            <h4>Feedback:</h4>
                            <p>{q.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Area for Improvement */}
              <div className={`improvement-panel ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.5s'}}>
                <h3>Areas for Improvement</h3>
                <div className="improvement-content">
                  {props.result.improvements.map((improvement, index) => (
                    <div key={index} className="improvement-item">
                      <span className="improvement-bullet">→</span>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Overall Feedback */}
              <div className={`overall-feedback-panel ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.7s'}}>
                <h3>Overall Feedback</h3>
                <p>{props.result.feedback}</p>
              </div>
              
              {/* Action Buttons */}
              <div className={`results-actions ${animationComplete ? 'animate-in' : ''}`} style={{animationDelay: '0.9s'}}>
                <button className="action-button primary cursor-target" onClick={handleDownloadReport}>
                  <span className="button-icon">📥</span>
                  Download Report
                </button>
                <button className="action-button secondary cursor-target" onClick={handleBackToDemo}>
                  <span className="button-icon">🔄</span>
                  Evaluate Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [cursorKey, setCursorKey] = useState(0);
  const [resultsData, setResultsData] = useState(null);
  const [pdfPreviewData, setPdfPreviewData] = useState(null);
  const [answerSheetFile, setAnswerSheetFile] = useState(null);
  const heroRef = useRef(null);
  const whatIsRef = useRef(null);
  const demoRef = useRef(null);
  const backendRef = useRef(null);
  const resultsRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const sectionsRef = useRef([heroRef, whatIsRef, demoRef, backendRef, resultsRef]);

  const navigateToSection = (sectionIndex) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    setIsScrolling(true);
    setCurrentSection(sectionIndex);
    setCursorKey(prev => prev + 1);
    
    const targetSection = sectionsRef.current[sectionIndex]?.current;
    
    if (targetSection) {
      targetSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 1000);
  };

  const handleNavigateToProcessing = (result, pdfPreview, pdfFile) => {
    setResultsData(result);
    setPdfPreviewData(pdfPreview);
    setAnswerSheetFile(pdfFile);
    navigateToSection(3);
  };

  const handleNavigateToResults = () => {
    navigateToSection(4);
  };

  const handleBackToDemo = () => {
    setResultsData(null);
    setPdfPreviewData(null);
    setAnswerSheetFile(null);
    navigateToSection(2);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isScrolling) {
            const sectionIndex = sectionsRef.current.findIndex(
              (ref) => ref.current === entry.target
            );
            if (sectionIndex !== -1 && sectionIndex !== currentSection) {
              setCurrentSection(sectionIndex);
              setCursorKey(prev => prev + 1);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    sectionsRef.current.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sectionsRef.current.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [currentSection, isScrolling]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (currentSection === 2 || currentSection === 3 || currentSection === 4) return;
      
      e.preventDefault();
      
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = Math.max(0, Math.min(4, currentSection + direction));
      
      if (nextSection !== currentSection) {
        navigateToSection(nextSection);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (currentSection === 2 || currentSection === 3 || currentSection === 4) return;
        
        e.preventDefault();
        
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const nextSection = Math.max(0, Math.min(4, currentSection + direction));
        
        if (nextSection !== currentSection) {
          navigateToSection(nextSection);
        }
      }
    };

    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e) => {
      if (currentSection === 2 || currentSection === 3 || currentSection === 4) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > 50) {
        const direction = diff > 0 ? 1 : -1;
        const nextSection = Math.max(0, Math.min(4, currentSection + direction));
        
        if (nextSection !== currentSection) {
          navigateToSection(nextSection);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSection]);

  return (
    <div className="app">
      <Hero ref={heroRef} />
      <WhatIsGradeX ref={whatIsRef} />
      <LiveDemo ref={demoRef} onNavigateToProcessing={handleNavigateToProcessing} />
      {resultsData && pdfPreviewData && (
        <BackendVisualization 
          ref={backendRef} 
          pdfPreview={pdfPreviewData}
          answerSheetFile={answerSheetFile}
          onNavigateToResults={handleNavigateToResults}
        />
      )}
      {resultsData && <Results ref={resultsRef} result={resultsData} onBackToDemo={handleBackToDemo} />}
      
      <TargetCursor 
        key={cursorKey}
        spinDuration={2}
        hideDefaultCursor={true}
        color="#ffffff"
      />
    </div>
  );
}

export default App;