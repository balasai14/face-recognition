# Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the Face Recognition and Crowd Analysis System.

## Database Optimization

### 1. Indexing Strategy

**Implemented Indexes:**

```javascript
// FaceProfile
FaceProfileSchema.index({ userId: 1 });
FaceProfileSchema.index({ isActive: 1 });

// AttendanceRecord
AttendanceSchema.index({ eventId: 1, timestamp: -1 });
AttendanceSchema.index({ 'attendees.userId': 1 });
AttendanceSchema.index({ timestamp: -1 });

// CrowdCountRecord
CrowdCountSchema.index({ timestamp: -1 });
CrowdCountSchema.index({ location: 1, timestamp: -1 });
```

**Verify Indexes:**
```bash
mongo face-recognition
db.faceprofiles.getIndexes()
```

### 2. Connection Pooling

Configured in `database.js`:
```javascript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000
});
```

### 3. Query Optimization

**Use Projection:**
```javascript
// Only fetch needed fields
FaceProfile.findOne({ userId }).select('name metadata');
```

**Use Lean Queries:**
```javascript
// Return plain JavaScript objects
FaceProfile.find({}).lean();
```

**Limit Results:**
```javascript
// Always limit large queries
AttendanceRecord.find({}).limit(100);
```

## Caching Strategy

### 1. Redis Caching

**Setup:**
```bash
# Install Redis
npm install redis

# Start Redis
redis-server

# Configure in .env
REDIS_URL=redis://localhost:6379
```

**Usage:**
```javascript
// Cache frequently accessed data
const cacheMiddleware = require('./middleware/cache');

// Cache for 1 hour
router.get('/api/individual/:userId', 
  cacheMiddleware(3600), 
  getProfile
);
```

### 2. Application-Level Caching

**Cache Face Embeddings:**
```javascript
const embeddingCache = new Map();

function getCachedEmbedding(imageHash) {
  return embeddingCache.get(imageHash);
}

function cacheEmbedding(imageHash, embedding) {
  embeddingCache.set(imageHash, embedding);
}
```

### 3. CDN for Static Assets

**Frontend Optimization:**
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Image Optimization

### 1. Compression

**Automatic Compression:**
```javascript
const imageOptimization = require('./utils/imageOptimization');

// Compress before storage
const compressed = await imageOptimization.compressImage(buffer, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80
});
```

### 2. Lazy Loading

**Frontend:**
```javascript
// Use lazy loading for images
<img loading="lazy" src={imageUrl} alt="Face" />
```

### 3. Thumbnail Generation

```javascript
// Generate thumbnails for quick preview
const thumbnail = await imageOptimization.generateThumbnail(buffer, 200);
```

## ML Service Optimization

### 1. Batch Processing

**Process Multiple Images:**
```python
from batch_processor import BatchProcessor

processor = BatchProcessor(batch_size=8)
results = processor.process_batch(images, model.predict)
```

### 2. Model Optimization

**Use Inference Mode:**
```python
import torch

model.eval()
torch.set_grad_enabled(False)

with torch.no_grad():
    output = model(input)
```

**Model Quantization:**
```python
# Reduce model size and increase speed
quantized_model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
```

### 3. GPU Acceleration

**Enable CUDA:**
```python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
input_tensor = input_tensor.to(device)
```

**Docker GPU Support:**
```yaml
# docker-compose.yml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### 4. Inference Caching

```python
from batch_processor import InferenceCache

cache = InferenceCache(max_size=1000)

def get_embedding(image_hash, image):
    cached = cache.get(image_hash)
    if cached:
        return cached
    
    embedding = model.predict(image)
    cache.set(image_hash, embedding)
    return embedding
```

## API Optimization

### 1. Response Compression

**Enable Gzip:**
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Pagination

**Implement Cursor-Based Pagination:**
```javascript
router.get('/api/group/attendance/history', async (req, res) => {
  const { cursor, limit = 50 } = req.query;
  
  const query = cursor ? { _id: { $lt: cursor } } : {};
  const records = await AttendanceRecord
    .find(query)
    .limit(limit)
    .sort({ _id: -1 });
  
  res.json({
    records,
    nextCursor: records.length > 0 ? records[records.length - 1]._id : null
  });
});
```

### 3. Async Processing

**Use Job Queues for Heavy Tasks:**
```javascript
const Bull = require('bull');
const faceProcessingQueue = new Bull('face-processing');

// Add job
faceProcessingQueue.add({ userId, images });

// Process job
faceProcessingQueue.process(async (job) => {
  const { userId, images } = job.data;
  // Process images asynchronously
});
```

## Frontend Optimization

### 1. Code Splitting

**Vite Configuration:**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material']
        }
      }
    }
  }
};
```

### 2. Lazy Loading Components

```javascript
import { lazy, Suspense } from 'react';

const CrowdCounter = lazy(() => import('./components/crowd/CrowdCounter'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <CrowdCounter />
    </Suspense>
  );
}
```

### 3. Memoization

```javascript
import { useMemo, useCallback } from 'react';

const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});
```

## Load Balancing

### 1. PM2 Cluster Mode

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
```

### 2. NGINX Load Balancing

```nginx
upstream backend {
    least_conn;
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Monitoring and Profiling

### 1. Performance Monitoring

```javascript
const metrics = require('./utils/metrics');

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordRequest(req.path, res.statusCode);
    
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});
```

### 2. Database Query Profiling

```javascript
mongoose.set('debug', (collectionName, method, query, doc) => {
  logger.debug(`${collectionName}.${method}`, JSON.stringify(query));
});
```

### 3. ML Service Benchmarking

```python
from batch_processor import benchmark_inference

# Benchmark model
avg_time = benchmark_inference(model, sample_input, num_runs=100)
```

## Performance Benchmarks

### Target Metrics

- **Individual Authentication:** < 2 seconds
- **Group Authentication:** < 5 seconds
- **Crowd Counting:** < 3 seconds
- **API Response Time:** < 500ms (excluding ML)
- **Database Queries:** < 500ms
- **Throughput:** 100+ requests/minute

### Monitoring

```bash
# Check API performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/health

# Monitor database
mongostat --host localhost:27017

# Monitor Redis
redis-cli --stat

# Monitor system resources
htop
```

## Scalability Considerations

### Horizontal Scaling

1. **Stateless API Servers**
   - No session state in memory
   - Use Redis for shared state
   - Enable easy replication

2. **Database Sharding**
   - Shard by userId for face profiles
   - Shard by timestamp for records

3. **ML Service Scaling**
   - Deploy multiple instances
   - Use load balancer
   - Consider GPU instances

### Vertical Scaling

1. **Increase Resources**
   - More CPU cores for API
   - More RAM for caching
   - GPU for ML services

2. **Optimize Resource Usage**
   - Connection pooling
   - Memory management
   - Efficient algorithms

## Best Practices

1. **Always Profile Before Optimizing**
   - Identify bottlenecks
   - Measure improvements
   - Don't premature optimize

2. **Monitor in Production**
   - Track key metrics
   - Set up alerts
   - Regular performance reviews

3. **Test Under Load**
   - Load testing
   - Stress testing
   - Capacity planning

4. **Continuous Optimization**
   - Regular audits
   - Update dependencies
   - Optimize queries
   - Review logs
