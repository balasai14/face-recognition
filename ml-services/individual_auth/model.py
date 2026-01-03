import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

def create_face_recognition_cnn(input_shape=(160, 160, 3), embedding_size=128):
    """
    Create CNN model for face recognition with embedding output
    Uses MobileNetV2 as backbone for efficiency
    """
    # Base model
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Build model
    inputs = layers.Input(shape=input_shape)
    
    # Preprocessing
    x = layers.Rescaling(1./255)(inputs)
    
    # Base model
    x = base_model(x, training=False)
    
    # Global pooling
    x = layers.GlobalAveragePooling2D()(x)
    
    # Dense layers
    x = layers.Dense(512, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    
    x = layers.Dense(256, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    
    # Embedding layer (L2 normalized)
    embeddings = layers.Dense(embedding_size)(x)
    embeddings = layers.Lambda(lambda x: tf.nn.l2_normalize(x, axis=1))(embeddings)
    
    model = models.Model(inputs=inputs, outputs=embeddings, name='face_recognition_cnn')
    
    return model

def triplet_loss(alpha=0.2):
    """
    Triplet loss function for face recognition
    Args:
        alpha: margin between positive and negative distances
    """
    def loss(y_true, y_pred):
        anchor, positive, negative = y_pred[:, 0], y_pred[:, 1], y_pred[:, 2]
        
        # Calculate distances
        pos_dist = tf.reduce_sum(tf.square(anchor - positive), axis=-1)
        neg_dist = tf.reduce_sum(tf.square(anchor - negative), axis=-1)
        
        # Triplet loss
        basic_loss = pos_dist - neg_dist + alpha
        loss = tf.reduce_mean(tf.maximum(basic_loss, 0.0))
        
        return loss
    
    return loss

def arcface_loss(num_classes, embedding_size=128, margin=0.5, scale=64):
    """
    ArcFace loss for face recognition
    More advanced than triplet loss
    """
    def loss(y_true, y_pred):
        # Normalize embeddings
        embeddings = tf.nn.l2_normalize(y_pred, axis=1)
        
        # Weight matrix
        W = tf.Variable(tf.random.normal([embedding_size, num_classes]))
        W_normalized = tf.nn.l2_normalize(W, axis=0)
        
        # Cosine similarity
        logits = tf.matmul(embeddings, W_normalized)
        
        # Add margin
        theta = tf.acos(logits)
        marginal_logits = tf.cos(theta + margin)
        
        # Scale
        logits = scale * marginal_logits
        
        # Cross entropy loss
        loss = tf.nn.softmax_cross_entropy_with_logits(labels=y_true, logits=logits)
        
        return tf.reduce_mean(loss)
    
    return loss

if __name__ == '__main__':
    # Create and save model architecture
    model = create_face_recognition_cnn()
    model.summary()
    
    # Save model architecture
    model.save('models/face_recognition_cnn_architecture.h5')
    print("Model architecture saved")
