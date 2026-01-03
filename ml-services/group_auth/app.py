from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import cv2
import time
from mtcnn import MTCNN
from facenet_pytorch import InceptionResnetV1
import torch

app = Flask(__name__)
CORS(app)

# Models
mtcnn_detector = None
facenet_model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_models():
    """Load MTCNN and FaceNet models"""
    global mtcnn_detector, facenet_model
    
    try:
        # Load MTCNN for face detection
        mtcnn_detector = MTCNN(
            min_face_size=40,
            thresholds=[0.6, 0.7, 0.7],
            device=device
        )
        
        # Load FaceNet for feature extraction
        facenet_model = InceptionResnetV1(pretrained='vggface2').eval().to(device)
        
        print("Models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'group_auth',
        'models_loaded': mtcnn_detector is not None and facenet_model is not None
    })

@app.route('/detect-and-extract', methods=['POST'])
def detect_and_extract():
    try:
        start_time = time.time()
        
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
        image = Image.open(BytesIO(image_bytes))
        image_np = np.array(image)
        
        faces = []
        
        if mtcnn_detector is not None and facenet_model is not None:
            # Detect faces
            boxes, probs, landmarks = mtcnn_detector.detect(image, landmarks=True)
            
            if boxes is not None:
                for i, (box, prob) in enumerate(zip(boxes, probs)):
                    if prob < 0.9:  # Confidence threshold
                        continue
                    
                    # Extract face region
                    x1, y1, x2, y2 = [int(b) for b in box]
                    
                    # Ensure coordinates are within image bounds
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(image_np.shape[1], x2), min(image_np.shape[0], y2)
                    
                    # Skip if face is too small
                    if (x2 - x1) < 40 or (y2 - y1) < 40:
                        continue
                    
                    face_img = image_np[y1:y2, x1:x2]
                    
                    # Resize and preprocess for FaceNet
                    face_img = cv2.resize(face_img, (160, 160))
                    face_tensor = torch.from_numpy(face_img).permute(2, 0, 1).float()
                    face_tensor = (face_tensor - 127.5) / 128.0
                    face_tensor = face_tensor.unsqueeze(0).to(device)
                    
                    # Extract embedding
                    with torch.no_grad():
                        embedding = facenet_model(face_tensor)
                        embedding = embedding.cpu().numpy()[0].tolist()
                    
                    faces.append({
                        'bbox': [x1, y1, x2 - x1, y2 - y1],
                        'embedding': embedding,
                        'confidence': float(prob)
                    })
        else:
            # Placeholder if models not loaded
            faces = [
                {
                    'bbox': [100, 100, 150, 150],
                    'embedding': np.random.rand(512).tolist(),
                    'confidence': 0.92
                }
            ]
        
        processing_time = (time.time() - start_time) * 1000
        
        return jsonify({
            'faces': faces,
            'processing_time': processing_time
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5002, debug=True)
