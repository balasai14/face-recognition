import tensorflow as tf
import numpy as np
from model import create_face_recognition_cnn, triplet_loss
from preprocessing import preprocess_image, augment_image
import os

def create_triplet_dataset(image_paths, labels, batch_size=32):
    """
    Create triplet dataset for training
    Args:
        image_paths: list of image file paths
        labels: list of corresponding labels
        batch_size: batch size for training
    """
    # This is a simplified version
    # In production, use proper triplet mining strategies
    pass

def train_model(train_data_dir, val_data_dir, epochs=50, batch_size=32):
    """
    Train the face recognition CNN model
    Args:
        train_data_dir: directory containing training images
        val_data_dir: directory containing validation images
        epochs: number of training epochs
        batch_size: batch size
    """
    # Create model
    model = create_face_recognition_cnn()
    
    # Compile model
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss=triplet_loss(alpha=0.2),
        metrics=['accuracy']
    )
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            'models/face_recognition_cnn_best.h5',
            save_best_only=True,
            monitor='val_loss'
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7
        )
    ]
    
    # Data generators
    train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2]
    )
    
    val_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    
    # Load data
    train_generator = train_datagen.flow_from_directory(
        train_data_dir,
        target_size=(160, 160),
        batch_size=batch_size,
        class_mode='categorical'
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_data_dir,
        target_size=(160, 160),
        batch_size=batch_size,
        class_mode='categorical'
    )
    
    # Train model
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    # Save final model
    model.save('models/face_recognition_cnn_final.h5')
    
    return model, history

def evaluate_model(model, test_data_dir):
    """
    Evaluate model on test dataset
    """
    test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    
    test_generator = test_datagen.flow_from_directory(
        test_data_dir,
        target_size=(160, 160),
        batch_size=32,
        class_mode='categorical'
    )
    
    results = model.evaluate(test_generator)
    print(f"Test Loss: {results[0]:.4f}")
    print(f"Test Accuracy: {results[1]:.4f}")
    
    return results

if __name__ == '__main__':
    # Note: This requires actual training data
    # For demonstration, the model architecture is created
    # In production, you would:
    # 1. Prepare dataset (LFW, CelebA, or custom)
    # 2. Run training: train_model('data/train', 'data/val')
    # 3. Evaluate: evaluate_model(model, 'data/test')
    
    print("Training script ready. Add training data to proceed.")
    print("Expected directory structure:")
    print("data/")
    print("  train/")
    print("    person1/")
    print("    person2/")
    print("  val/")
    print("  test/")
