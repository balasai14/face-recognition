import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

class BatchProcessor:
    """
    Batch processing utility for ML inference
    Improves throughput by processing multiple images together
    """
    
    def __init__(self, batch_size=8, max_workers=4):
        self.batch_size = batch_size
        self.max_workers = max_workers
    
    def process_batch(self, images, process_func):
        """
        Process a batch of images
        Args:
            images: List of images to process
            process_func: Function to apply to each image
        Returns:
            List of results
        """
        results = []
        
        # Process in batches
        for i in range(0, len(images), self.batch_size):
            batch = images[i:i + self.batch_size]
            batch_results = self._process_single_batch(batch, process_func)
            results.extend(batch_results)
        
        return results
    
    def _process_single_batch(self, batch, process_func):
        """Process a single batch"""
        # Stack images into batch tensor
        batch_tensor = np.stack(batch)
        
        # Process batch
        results = process_func(batch_tensor)
        
        return results
    
    def process_parallel(self, items, process_func):
        """
        Process items in parallel using thread pool
        Args:
            items: List of items to process
            process_func: Function to apply to each item
        Returns:
            List of results
        """
        results = [None] * len(items)
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all tasks
            future_to_index = {
                executor.submit(process_func, item): i 
                for i, item in enumerate(items)
            }
            
            # Collect results
            for future in as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    results[index] = future.result()
                except Exception as e:
                    print(f"Error processing item {index}: {e}")
                    results[index] = None
        
        return results

class InferenceCache:
    """
    Simple LRU cache for inference results
    Reduces redundant computations
    """
    
    def __init__(self, max_size=1000):
        self.cache = {}
        self.access_order = []
        self.max_size = max_size
    
    def get(self, key):
        """Get cached result"""
        if key in self.cache:
            # Update access order
            self.access_order.remove(key)
            self.access_order.append(key)
            return self.cache[key]
        return None
    
    def set(self, key, value):
        """Cache result"""
        if key in self.cache:
            # Update existing
            self.access_order.remove(key)
        elif len(self.cache) >= self.max_size:
            # Remove least recently used
            lru_key = self.access_order.pop(0)
            del self.cache[lru_key]
        
        self.cache[key] = value
        self.access_order.append(key)
    
    def clear(self):
        """Clear cache"""
        self.cache.clear()
        self.access_order.clear()

def optimize_model_for_inference(model):
    """
    Optimize model for inference
    - Set to eval mode
    - Disable gradient computation
    - Use inference optimizations
    """
    import torch
    
    if hasattr(model, 'eval'):
        model.eval()
    
    # Disable gradient computation
    for param in model.parameters():
        param.requires_grad = False
    
    # Use inference mode
    torch.set_grad_enabled(False)
    
    return model

def benchmark_inference(model, input_data, num_runs=100):
    """
    Benchmark model inference speed
    Returns average inference time in milliseconds
    """
    times = []
    
    # Warmup
    for _ in range(10):
        _ = model(input_data)
    
    # Benchmark
    for _ in range(num_runs):
        start = time.time()
        _ = model(input_data)
        end = time.time()
        times.append((end - start) * 1000)
    
    avg_time = np.mean(times)
    std_time = np.std(times)
    
    print(f"Average inference time: {avg_time:.2f}ms (±{std_time:.2f}ms)")
    print(f"Throughput: {1000/avg_time:.2f} inferences/second")
    
    return avg_time
