"""
Alignment Agent: Image preprocessing for OCR accuracy

Uses OpenCV for deskewing and cropping scanned exam images.
Also handles PDF to image conversion.
"""

import cv2
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

try:
    from pdf2image import convert_from_path
except ImportError:
    logger.warning("pdf2image not installed. PDF processing disabled.")
    convert_from_path = None

def align_images(image_path: str) -> str:
    """
    Align and deskew the input image for better OCR accuracy.
    Returns the path to the aligned image.
    """
    try:
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Edge detection
        edges = cv2.Canny(blurred, 50, 150)

        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            logger.warning("No contours found, returning original image")
            return image_path

        # Find the largest contour (assuming it's the document)
        largest_contour = max(contours, key=cv2.contourArea)

        # Approximate the contour to a polygon
        epsilon = 0.02 * cv2.arcLength(largest_contour, True)
        approx = cv2.approxPolyDP(largest_contour, epsilon, True)

        if len(approx) == 4:
            # Perspective transform for quadrilateral
            pts = approx.reshape(4, 2)
            rect = np.zeros((4, 2), dtype="float32")

            # Order points: top-left, top-right, bottom-right, bottom-left
            s = pts.sum(axis=1)
            rect[0] = pts[np.argmin(s)]
            rect[2] = pts[np.argmax(s)]

            diff = np.diff(pts, axis=1)
            rect[1] = pts[np.argmin(diff)]
            rect[3] = pts[np.argmax(diff)]

            # Compute width and height
            width_a = np.sqrt(((rect[2][0] - rect[3][0]) ** 2) + ((rect[2][1] - rect[3][1]) ** 2))
            width_b = np.sqrt(((rect[1][0] - rect[0][0]) ** 2) + ((rect[1][1] - rect[0][1]) ** 2))
            max_width = max(int(width_a), int(width_b))

            height_a = np.sqrt(((rect[2][0] - rect[1][0]) ** 2) + ((rect[2][1] - rect[1][1]) ** 2))
            height_b = np.sqrt(((rect[3][0] - rect[0][0]) ** 2) + ((rect[3][1] - rect[0][1]) ** 2))
            max_height = max(int(height_a), int(height_b))

            dst = np.array([
                [0, 0],
                [max_width - 1, 0],
                [max_width - 1, max_height - 1],
                [0, max_height - 1]], dtype="float32")

            # Perspective transform
            M = cv2.getPerspectiveTransform(rect, dst)
            warped = cv2.warpPerspective(image, M, (max_width, max_height))
        else:
            # Simple deskew for non-quadrilateral
            coords = np.column_stack(np.where(gray > 0))
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle

            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            warped = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        # Save aligned image in processed_images folder
        processed_dir = Path("../../processed_images")
        processed_dir.mkdir(exist_ok=True)
        aligned_filename = f"{Path(image_path).stem}_aligned.png"
        aligned_path = processed_dir / aligned_filename
        cv2.imwrite(str(aligned_path), warped)

        logger.info(f"Image aligned and saved to {aligned_path}")
        return str(aligned_path)

    except Exception as e:
        logger.error(f"Alignment failed for {image_path}: {e}")
        return image_path  # Return original on failure

def process_pdf_to_images(pdf_path: str) -> list[str]:
    """
    Convert PDF pages to images and return list of image paths.
    """
    if not convert_from_path:
        raise ImportError("pdf2image required for PDF processing")

    try:
        images = convert_from_path(pdf_path)
        image_paths = []
        pdf_name = Path(pdf_path).stem
        processed_dir = Path("../../processed_images")
        processed_dir.mkdir(exist_ok=True)

        for i, image in enumerate(images):
            image_filename = f"{pdf_name}_page_{i+1}.png"
            image_path = processed_dir / image_filename
            image.save(str(image_path), "PNG")
            image_paths.append(str(image_path))

        logger.info(f"Converted PDF {pdf_path} to {len(image_paths)} images in {processed_dir}")
        return image_paths

    except Exception as e:
        logger.error(f"PDF processing failed for {pdf_path}: {e}")
        return []