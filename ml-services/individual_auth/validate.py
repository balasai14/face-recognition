import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from model import create_face_recognition_cnn
import tensorflow as tf
import json

def validate_model(model_path, test_data_dir):
    """
    Validate CNN model on test dataset
    Args:
        model_path: Path to trained model
        test_data_dir: Directory containing test images
    Returns:
        Dictionary with validation metrics
    """
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Load test data
    test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    test_generator = test_datagen.flow_from_directory(
        test_data_dir,
        target_size=(160, 160),
        batch_size=32,
        class_mode='categorical',
        shuffle=False
    )
    
    # Get predictions
    predictions = model.predict(test_generator)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = test_generator.classes
    
    # Calculate metrics
    accuracy = accuracy_score(true_classes, predicted_classes)
    precision = precision_score(true_classes, predicted_classes, average='weighted')
    recall = recall_score(true_classes, predicted_classes, average='weighted')
    f1 = f1_score(true_classes, predicted_classes, average='weighted')
    
    metrics = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'total_samples': len(true_classes),
        'num_classes': len(test_generator.class_indices)
    }
    
    print("Validation Results:")
    print(f"Accuracy: {accuracy:.4f} (Target: >= 0.95)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    # Check if meets requirements
    if accuracy >= 0.95:
        print("✓ Model meets accuracy requirement (>= 95%)")
    else:
        print("✗ Model does not meet accuracy requirement")
    
    return metrics

def test_lighting_conditions(model, test_images_dir):
    """
    Test model performance under different lighting conditions
    """
    lighting_conditions = ['100lux', '500lux', '1000lux']
    results = {}
    
    for condition in lighting_conditions:
        condition_dir = f"{test_images_dir}/{condition}"
        # Test with images from this lighting condition
        # Implementation would load and test images
        results[condition] = {
            'accuracy': 0.0,  # Placeholder
            'samples': 0
        }
    
    return results

def test_angle_variations(model, test_images_dir):
    """
    Test model performance with different head angles
    """
    angles = ['0deg', '15deg', '30deg']
    results = {}
    
    for angle in angles:
        angle_dir = f"{test_images_dir}/{angle}"
        # Test with images from this angle
        results[angle] = {
            'accuracy': 0.0,  # Placeholder
            'samples': 0
        }
    
    return results

def save_validation_report(metrics, output_path='validation_report.json'):
    """
    Save validation report to file
    """
    with open(output_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"Validation report saved to {output_path}")

if __name__ == '__main__':
    print("Model Validation Script")
    print("=" * 50)
    print("\nNote: This script requires a trained model and test dataset.")
    print("Expected directory structure:")
    print("  data/test/")
    print("    person1/")
    print("    person2/")
    print("    ...")
    print("\nTo run validation:")
    print("  1. Train the model using train.py")
    print("  2. Prepare test dataset with 1000+ diverse images")
    print("  3. Run: python validate.py")
    print("\nValidation will check:")
    print("  - Overall accuracy (target: >= 95%)")
    print("  - Performance under different lighting (100-1000 lux)")
    print("  - Performance with head angles (0-30 degrees)")
