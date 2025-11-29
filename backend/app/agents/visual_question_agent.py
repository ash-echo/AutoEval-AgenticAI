"""
Visual Question Analysis Agent using Qwen 2 VL Instruct 2B

This agent handles visual question papers with:
- MCQ questions with options (a,b,c,d or i,ii,iii,iv)
- Fill-in-the-blank questions
- Visual diagrams and charts that need analysis
- Question detection (Q1, Q2, Q3 or 1, 2, 3 formats)

Features:
- Question segmentation and detection
- Visual element analysis
- MCQ option recognition
- AI-powered visual reasoning for answers
"""

import os
import sys
import json
import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from PIL import Image, ImageDraw
import cv2
import numpy as np

logger = logging.getLogger(__name__)

try:
    import torch
    from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, Qwen2VLProcessor
except ImportError as e:
    logger.error(f"Import failed: {e}")
    sys.exit(1)

class VisualQuestionAgent:
    def __init__(self, model_name: str = "Qwen/Qwen2-VL-2B-Instruct"):
        """Initialize the visual question analysis agent."""
        if not torch.cuda.is_available():
            raise RuntimeError("CUDA GPU required for visual question processing.")
        
        self.device = torch.device("cuda")
        logger.info(f"Using GPU device: {self.device}")
        
        try:
            self.model = Qwen2VLForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            self.processor = Qwen2VLProcessor.from_pretrained(model_name)
            logger.info("Visual question model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def detect_questions(self, image: Image.Image) -> List[Dict]:
        """
        Detect question numbers and their locations in the image.
        Returns list of detected questions with bounding boxes.
        """
        # Convert PIL image to CV2 format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        detected_questions = []
        
        # Question patterns to detect
        question_patterns = [
            r'\b(Q\s*\d+|Question\s*\d+|\d+\.|\d+\))\s*',  # Q1, Q2, Question 1, 1., 1)
            r'\b(\d+)\s*[\.)\-]\s*',  # 1. 2. 3. or 1) 2) 3)
        ]
        
        # Use OCR to detect text regions first
        try:
            # Create a simple text detection using contours
            # This is a basic approach - in production, you might want to use a more sophisticated method
            
            # Apply threshold to get binary image
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours that might contain questions
            question_regions = []
            for i, contour in enumerate(contours):
                x, y, w, h = cv2.boundingRect(contour)
                area = cv2.contourArea(contour)
                
                # Filter based on size (questions are usually mid-sized regions)
                if 100 < area < 50000 and w > 20 and h > 20:
                    question_regions.append({
                        'id': f'region_{i}',
                        'bbox': (x, y, x+w, y+h),
                        'area': area,
                        'question_number': None
                    })
            
            # Sort regions by y-coordinate (top to bottom) then x-coordinate (left to right)
            question_regions.sort(key=lambda r: (r['bbox'][1], r['bbox'][0]))
            
            # Assign question numbers based on position
            for i, region in enumerate(question_regions[:20]):  # Limit to first 20 regions
                region['question_number'] = i + 1
                detected_questions.append(region)
            
            logger.info(f"Detected {len(detected_questions)} potential question regions")
            
        except Exception as e:
            logger.error(f"Question detection failed: {e}")
            # Fallback: create default regions
            h, w = gray.shape
            # Divide image into 4 equal sections as fallback
            section_h = h // 4
            for i in range(4):
                detected_questions.append({
                    'id': f'section_{i+1}',
                    'bbox': (0, i * section_h, w, (i+1) * section_h),
                    'area': w * section_h,
                    'question_number': i + 1
                })
        
        return detected_questions
    
    def detect_mcq_options(self, text: str) -> Dict[str, str]:
        """
        Detect MCQ options in text.
        Returns dictionary mapping option labels to their text.
        """
        options = {}
        
        # Common option patterns
        patterns = [
            r'([a-d])\)\s*([^\n]+)',  # a) option text
            r'([a-d])\.\s*([^\n]+)',  # a. option text
            r'\(([a-d])\)\s*([^\n]+)',  # (a) option text
            r'([ivx]+)\)\s*([^\n]+)',  # i) ii) iii) iv) roman numerals
            r'([ivx]+)\.\s*([^\n]+)',  # i. ii. iii. iv. roman numerals
            r'\(([ivx]+)\)\s*([^\n]+)',  # (i) (ii) (iii) (iv) roman numerals
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                option_label = match.group(1).lower()
                option_text = match.group(2).strip()
                if option_text and len(option_text) > 2:  # Valid option text
                    options[option_label] = option_text
        
        return options
    
    def crop_question_region(self, image: Image.Image, bbox: Tuple[int, int, int, int]) -> Image.Image:
        """Crop a specific question region from the image."""
        x1, y1, x2, y2 = bbox
        return image.crop((x1, y1, x2, y2))
    
    def analyze_visual_question(self, image: Image.Image, question_text: str = "") -> Dict:
        """
        Analyze a visual question using Qwen 2 VL model.
        Returns the analysis and suggested answer.
        """
        try:
            # Create conversation for visual analysis
            conversation = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image", "image": image},
                        {"type": "text", "text": f"""Analyze this visual question image. Look for:

1. Any visual elements like diagrams, charts, pictures, shapes, or mathematical figures
2. Question text and multiple choice options (a,b,c,d or i,ii,iii,iv)
3. Fill-in-the-blank questions
4. Any counting or measurement tasks

Based on the visual content, provide:
- A description of what you see in the image
- The question being asked
- All available answer options (if MCQ)
- Your reasoned answer with explanation
- Confidence level (1-10)

Question context: {question_text}

Respond in JSON format:
{{
    "visual_description": "description of visual elements",
    "question_text": "the question being asked",
    "question_type": "mcq|fill_blank|counting|other",
    "options": {{"a": "option text", "b": "option text", ...}},
    "answer": "your answer",
    "reasoning": "explanation of your reasoning",
    "confidence": 8
}}"""}
                    ]
                }
            ]
            
            # Process the conversation
            text = self.processor.apply_chat_template(conversation, tokenize=False, add_generation_prompt=True)
            inputs = self.processor(
                text=[text],
                images=[image],
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    temperature=0.1,
                    do_sample=True
                )
                
                # Decode the response
                generated_ids_trimmed = [
                    out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
                ]
                response = self.processor.batch_decode(
                    generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
                )[0]
            
            logger.info(f"Visual analysis response: {response[:200]}...")
            
            # Try to parse JSON response
            try:
                # Extract JSON from response
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_str = response[json_start:json_end]
                    analysis = json.loads(json_str)
                else:
                    # Fallback parsing
                    analysis = {
                        "visual_description": "Analysis completed",
                        "question_text": question_text,
                        "question_type": "other",
                        "options": {},
                        "answer": "Analysis provided in raw response",
                        "reasoning": response,
                        "confidence": 7
                    }
            except json.JSONDecodeError:
                # Fallback structure
                analysis = {
                    "visual_description": "Visual analysis completed",
                    "question_text": question_text,
                    "question_type": "other",
                    "options": {},
                    "answer": "See reasoning for details",
                    "reasoning": response,
                    "confidence": 6
                }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Visual analysis failed: {e}")
            return {
                "visual_description": "Analysis failed",
                "question_text": question_text,
                "question_type": "error",
                "options": {},
                "answer": "Unable to analyze",
                "reasoning": f"Error occurred: {str(e)}",
                "confidence": 0
            }
    
    def process_visual_paper(self, image_path: str) -> Dict:
        """
        Process a complete visual question paper.
        Returns structured analysis of all detected questions.
        """
        try:
            # Open the image
            if isinstance(image_path, str):
                image = Image.open(image_path).convert('RGB')
            else:
                image = image_path  # Already PIL Image
            
            logger.info(f"Processing visual question paper: {image.size}")
            
            # Detect questions in the image
            detected_questions = self.detect_questions(image)
            
            results = {
                "status": "success",
                "total_questions": len(detected_questions),
                "questions": {},
                "full_image_analysis": None
            }
            
            # First, analyze the full image to get overall context
            full_analysis = self.analyze_visual_question(image, "Analyze this complete question paper")
            results["full_image_analysis"] = full_analysis
            
            # Process each detected question region
            for i, question_region in enumerate(detected_questions):
                q_id = f"Q{question_region['question_number']}"
                
                try:
                    # Crop the question region
                    cropped_image = self.crop_question_region(image, question_region['bbox'])
                    
                    # Analyze this specific question
                    analysis = self.analyze_visual_question(
                        cropped_image, 
                        f"Question {question_region['question_number']}"
                    )
                    
                    # Store the analysis
                    results["questions"][q_id] = {
                        "region_info": question_region,
                        "analysis": analysis
                    }
                    
                    logger.info(f"Processed {q_id}: {analysis.get('question_type', 'unknown')} question")
                    
                except Exception as e:
                    logger.error(f"Failed to process question region {q_id}: {e}")
                    results["questions"][q_id] = {
                        "region_info": question_region,
                        "analysis": {
                            "error": str(e),
                            "status": "failed"
                        }
                    }
            
            return results
            
        except Exception as e:
            logger.error(f"Visual paper processing failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "total_questions": 0,
                "questions": {}
            }
    
    def cleanup(self):
        """Clean up GPU memory."""
        if hasattr(self, 'model'):
            del self.model
        if hasattr(self, 'processor'):
            del self.processor
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Visual question agent cleaned up")

# Standalone function for easy import
def process_visual_questions(image_path: str) -> Dict:
    """
    Standalone function to process visual questions.
    Creates agent instance, processes, and cleans up.
    """
    agent = None
    try:
        agent = VisualQuestionAgent()
        return agent.process_visual_paper(image_path)
    except Exception as e:
        logger.error(f"Visual question processing failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "total_questions": 0,
            "questions": {}
        }
    finally:
        if agent:
            agent.cleanup()