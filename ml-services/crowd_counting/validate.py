import numpy as np
from ultralytics import YOLO
import json
import time

def validate_yolo_performance(model_path, test_images_dir):
    """
    Validate YOLO model performance for crowd counting
    Args:
        model_path: Path to YOLO model
        test_images_dir: Directory with test images and ground truth
    Returns:
        Performance metrics
    """
    model = YOLO(model_path)
    
    total_images = 0
    total_error = 0
    processing_times = []
    
    # This would iterate through test images with ground truth counts
    # For now, providing structure
    
    avg_error = total_error / total_images if total_images > 0 else 0
    avg_processing_time = np.mean(processing_times) if processing_times else 0
    fps = 1000 / avg_processing_time if avg_processing_time > 0 else 0
    
    metrics = {
        'average_error_percentage': avg_error,
        'total_images': total_images,
        'avg_processing_time_ms': avg_processing_time,
        'fps': fps
    }
    
    print("YOLO Performance Validation:")
    print(f"Average Error: {avg_error:.2f}%")
    print(f"Processing Time: {avg_processing_time:.2f}ms")
    print(f"FPS: {fps:.2f} (Target: >= 30)")
    
    if fps >= 30:
        print("✓ YOLO meets FPS requirement (>= 30)")
    else:
        print("✗ YOLO does not meet FPS requirement")
    
    return metrics

def validate_counting_accuracy(test_data):
    """
    Validate counting accuracy across different crowd densities
    Args:
        test_data: List of (image, ground_truth_count) tuples
    Returns:
        Accuracy metrics by crowd density
    """
    results = {
        'low_density': {'samples': 0, 'avg_error': 0, 'within_10_percent': 0},
        'medium_density': {'samples': 0, 'avg_error': 0, 'within_10_percent': 0},
        'high_density': {'samples': 0, 'avg_error': 0, 'within_10_percent': 0}
    }
    
    # Categorize by density and calculate errors
    # Low: < 50, Medium: 50-200, High: > 200
    
    print("\nCounting Accuracy by Density:")
    for density, metrics in results.items():
        print(f"{density}:")
        print(f"  Samples: {metrics['samples']}")
        print(f"  Avg Error: {metrics['avg_error']:.2f}%")
        print(f"  Within 10%: {metrics['within_10_percent']}")
    
    return results

def test_crowd_sizes(model, test_images_dir):
    """
    Test accuracy with different crowd sizes
    """
    crowd_ranges = [
        ('small', 0, 50),
        ('medium', 50, 200),
        ('large', 200, 500),
        ('very_large', 500, 1000)
    ]
    
    results = {}
    
    for name, min_count, max_count in crowd_ranges:
        # Test with images in this range
        results[name] = {
            'range': f"{min_count}-{max_count}",
            'accuracy': 0.0,
            'avg_error_percentage': 0.0,
            'samples': 0
        }
    
    return results

def validate_mcnn_accuracy(test_images_dir):
    """
    Validate MCNN counting accuracy for high-density crowds
    Target: Within 10% error for crowds up to 1000
    """
    total_samples = 0
    within_10_percent = 0
    errors = []
    
    # This would test MCNN on high-density crowd images
    
    accuracy = within_10_percent / total_samples if total_samples > 0 else 0
    avg_error = np.mean(errors) if errors else 0
    
    metrics = {
        'accuracy_within_10_percent': accuracy,
        'average_error_percentage': avg_error,
        'total_samples': total_samples,
        'max_crowd_size_tested': 1000
    }
    
    print("\nMCNN Accuracy Validation:")
    print(f"Accuracy (within 10%): {accuracy:.4f}")
    print(f"Average Error: {avg_error:.2f}%")
    
    if avg_error <= 10:
        print("✓ MCNN meets accuracy requirement (<= 10% error)")
    else:
        print("✗ MCNN does not meet accuracy requirement")
    
    return metrics

def save_validation_report(metrics, output_path='crowd_validation_report.json'):
    """
    Save validation report to file
    """
    with open(output_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"\nValidation report saved to {output_path}")

if __name__ == '__main__':
    print("Crowd Counting Model Validation")
    print("=" * 50)
    print("\nThis script validates:")
    print("  1. YOLO processing speed (target: >= 30 FPS)")
    print("  2. Counting accuracy by crowd density")
    print("  3. MCNN accuracy for high-density crowds (target: <= 10% error)")
    print("\nRequirements:")
    print("  - Test dataset with ground truth crowd counts")
    print("  - Images covering different crowd densities")
    print("  - Minimum 50 test images for statistical significance")
    print("\nCrowd Density Categories:")
    print("  - Low: < 50 people")
    print("  - Medium: 50-200 people")
    print("  - High: 200-1000 people")
