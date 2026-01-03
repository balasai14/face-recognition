# Model Validation Guide

## Overview

This guide provides instructions for validating all deep learning models in the Face Recognition and Crowd Analysis System.

## Prerequisites

### Test Datasets Required

1. **Individual Authentication (CNN)**
   - 1000+ diverse facial images
   - Multiple ethnicities, ages, genders
   - Various lighting conditions (100-1000 lux)
   - Different angles (0-30 degrees)
   - Public datasets: LFW, CelebA, or custom

2. **Group Authentication (MTCNN + FaceNet)**
   - 100+ group images with 2-30 people
   - Annotated face locations (ground truth)
   - Face pair dataset for embedding validation
   - Various group sizes and compositions

3. **Crowd Counting (YOLO + MCNN)**
   - 50+ crowd images with ground truth counts
   - Range: 10-1000 people
   - Different densities (low, medium, high)
   - Various environments and lighting

## Validation Process

### 1. Individual Authentication CNN

**Target Metrics:**
- Accuracy: >= 95%
- Lighting tolerance: 100-1000 lux
- Angle tolerance: 0-30 degrees

**Steps:**

```bash
cd ml-services/individual_auth

# 1. Prepare test dataset
mkdir -p data/test
# Organize images: data/test/person1/, data/test/person2/, etc.

# 2. Run validation
python validate.py

# 3. Review results
cat validation_report.json
```

**Expected Output:**
```json
{
  "accuracy": 0.95,
  "precision": 0.94,
  "recall": 0.95,
  "f1_score": 0.945,
  "total_samples": 1000,
  "num_classes": 100
}
```

### 2. Group Authentication (MTCNN + FaceNet)

**Target Metrics:**
- MTCNN detection rate: >= 98% (faces > 40x40px)
- FaceNet embedding dimension: 512
- Group size support: 2-30 people

**Steps:**

```bash
cd ml-services/group_auth

# 1. Prepare test dataset
mkdir -p data/test/groups
# Add group images with annotations

# 2. Run validation
python validate.py

# 3. Review results
cat group_validation_report.json
```

**Expected Output:**
```json
{
  "detection_rate": 0.98,
  "total_faces": 500,
  "detected_faces": 490,
  "false_positives": 5,
  "embedding_accuracy": 0.96
}
```

### 3. Crowd Counting (YOLO + MCNN)

**Target Metrics:**
- YOLO FPS: >= 30
- Counting accuracy: <= 10% error
- Max crowd size: 1000 people

**Steps:**

```bash
cd ml-services/crowd_counting

# 1. Prepare test dataset
mkdir -p data/test/crowds
# Add crowd images with ground truth counts

# 2. Run validation
python validate.py

# 3. Review results
cat crowd_validation_report.json
```

**Expected Output:**
```json
{
  "average_error_percentage": 8.5,
  "fps": 32,
  "accuracy_within_10_percent": 0.92,
  "max_crowd_size_tested": 1000
}
```

## Automated Testing

Run all validations:

```bash
# From project root
python tests/run_all_validations.py
```

This will:
1. Validate all three models
2. Generate comprehensive report
3. Check if all requirements are met
4. Output pass/fail status

## Continuous Validation

### During Development

- Run validation after each model update
- Track metrics over time
- Compare against baseline

### Before Deployment

- Full validation on all test sets
- Performance benchmarking
- Edge case testing

## Troubleshooting

### Low Accuracy

**Individual CNN:**
- Increase training data diversity
- Adjust augmentation parameters
- Fine-tune learning rate
- Check for data imbalance

**MTCNN Detection:**
- Adjust confidence thresholds
- Check image quality
- Verify face size requirements

**Crowd Counting:**
- Retrain on similar crowd densities
- Adjust detection confidence
- Use ensemble methods

### Performance Issues

**Slow Processing:**
- Use smaller model variants
- Enable GPU acceleration
- Optimize batch processing
- Reduce image resolution

**High Memory Usage:**
- Reduce batch size
- Use model quantization
- Clear cache between batches

## Reporting

### Validation Report Format

Each validation generates a JSON report with:
- Model version
- Test dataset details
- Metrics (accuracy, precision, recall, etc.)
- Performance benchmarks
- Pass/fail status
- Timestamp

### Sharing Results

1. Save reports to `tests/validation_reports/`
2. Include in documentation
3. Track in version control
4. Review in team meetings

## Best Practices

1. **Regular Validation**
   - Weekly during active development
   - Before each release
   - After dataset updates

2. **Version Control**
   - Tag model versions
   - Link reports to versions
   - Track metric trends

3. **Documentation**
   - Document test procedures
   - Record edge cases
   - Note failure modes

4. **Continuous Improvement**
   - Analyze failures
   - Expand test coverage
   - Update requirements as needed

## Requirements Checklist

- [ ] Individual CNN: >= 95% accuracy
- [ ] Individual CNN: Works in 100-1000 lux
- [ ] Individual CNN: Handles 0-30 degree angles
- [ ] MTCNN: >= 98% detection rate
- [ ] MTCNN: Detects faces >= 40x40px
- [ ] FaceNet: 512-dim embeddings
- [ ] YOLO: >= 30 FPS
- [ ] MCNN: <= 10% counting error
- [ ] System: Handles 1000+ registered users
- [ ] System: Processes groups of 10+ people
- [ ] System: Counts crowds up to 1000
