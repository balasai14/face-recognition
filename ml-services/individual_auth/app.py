from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import time
from preprocessing import preprocess_image, detect_face

app = Flask(__name__)
CORS(app)

# Model will be loaded here
# For now, using a placeholder until CNN model is trained
model = None

def load_model():
    """Load the trained CNN model"""
    global model
    # TODO: Load actual trained model
    # model = tf.keras.models.load_model('models/face_recognition_cnn.h5')
    pass

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'service': 'individual_auth',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        start_time = time.time()
        
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Detect and crop face
        face_image = detect_face(image)
        
        # Preprocess for model
        processed_image = preprocess_image(face_image)
        
        # Add batch dimension
        input_tensor = np.expand_dims(processed_image, axis=0)
        
        # Model inference
        if model is not None:
            embedding = model.predict(input_tensor)[0].tolist()
            confidence = 0.95
        else:
            # Placeholder until model is trained
            embedding = np.random.rand(128).tolist()
            confidence = 0.95
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return jsonify({
            'embedding': embedding,
            'confidence': confidence,
            'processing_time': processing_time
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5001, debug=True)
