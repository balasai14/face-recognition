import cv2
import numpy as np
from PIL import Image

def preprocess_image(image, target_size=(160, 160)):
    """
    Preprocess image for CNN model input
    Args:
        image: PIL Image or numpy array
        target_size: tuple of (height, width)
    Returns:
        Preprocessed numpy array
    """
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    # Convert to RGB if needed
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
    
    # Resize to target size
    image = cv2.resize(image, target_size)
    
    # Normalize pixel values to [0, 1]
    image = image.astype(np.float32) / 255.0
    
    # Standardize (mean=0, std=1)
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    image = (image - mean) / std
    
    return image

def detect_face(image):
    """
    Detect face in image using OpenCV Haar Cascade
    Returns cropped face or original image if no face detected
    """
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    
    # Load Haar Cascade
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    if len(faces) > 0:
        # Return the largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        return image[y:y+h, x:x+w]
    
    return image

def augment_image(image):
    """
    Apply data augmentation for training
    """
    augmented = []
    
    # Original
    augmented.append(image)
    
    # Horizontal flip
    augmented.append(cv2.flip(image, 1))
    
    # Brightness adjustment
    bright = cv2.convertScaleAbs(image, alpha=1.2, beta=10)
    augmented.append(bright)
    
    dark = cv2.convertScaleAbs(image, alpha=0.8, beta=-10)
    augmented.append(dark)
    
    return augmented
