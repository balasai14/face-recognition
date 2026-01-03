# End-to-End Testing Guide

## Overview

This guide provides instructions for running comprehensive end-to-end tests for the Face Recognition and Crowd Analysis System.

## Test Environment Setup

### Prerequisites

1. **Running Services**
   ```bash
   # Start all services with Docker
   docker-compose up -d
   
   # Or start individually
   # MongoDB
   mongod --dbpath ./data/db
   
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   
   # ML Services
   cd ml-services/individual_auth && python app.py
   cd ml-services/group_auth && python app.py
   cd ml-services/crowd_counting && python app.py
   ```

2. **Test Data**
   - Test user accounts
   - Sample facial images (individual, group, crowd)
   - Ground truth data for validation

3. **Environment Variables**
   ```bash
   export MONGODB_TEST_URI=mongodb://localhost:27017/face-recognition-test
   export JWT_SECRET=test-secret-key
   export ML_SERVICE_INDIVIDUAL_URL=http://localhost:5001
   export ML_SERVICE_GROUP_URL=http://localhost:5002
   export ML_SERVICE_CROWD_URL=http://localhost:5003
   ```

## Running Tests

### Integration Tests

```bash
cd backend

# Run all integration tests
npm test

# Run specific test suite
npm test -- individual.test.js
npm test -- group.test.js
npm test -- crowd.test.js
npm test -- security.test.js

# Run with coverage
npm test -- --coverage
```

### Manual E2E Testing

#### 1. Individual Authentication Flow

**Test Case: Complete Registration and Authentication**

1. **Register User Account**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```
   Expected: 201 status, JWT token returned

2. **Register Face Profile**
   ```bash
   curl -X POST http://localhost:5000/api/individual/register \
     -H "Authorization: Bearer <token>" \
     -F "name=Test User" \
     -F "age=30" \
     -F "images=@test-image1.jpg" \
     -F "images=@test-image2.jpg" \
     -F "images=@test-image3.jpg" \
     -F "images=@test-image4.jpg" \
     -F "images=@test-image5.jpg"
   ```
   Expected: 201 status, face profile created

3. **Authenticate User**
   ```bash
   curl -X POST http://localhost:5000/api/individual/authenticate \
     -H "Authorization: Bearer <token>" \
     -F "image=@auth-test.jpg"
   ```
   Expected: 200 status, authenticated=true, confidence >= 0.85, time < 2000ms

4. **Verify in UI**
   - Navigate to http://localhost:3000
   - Login with credentials
   - Go to Individual Authentication
   - Upload test image
   - Verify results display correctly

**Success Criteria:**
- ✓ Registration completes successfully
- ✓ Authentication returns correct user
- ✓ Confidence score >= 85%
- ✓ Processing time < 2 seconds
- ✓ UI displays results correctly

#### 2. Group Authentication Flow

**Test Case: Group Attendance Tracking**

1. **Authenticate Group**
   ```bash
   curl -X POST http://localhost:5000/api/group/authenticate \
     -H "Authorization: Bearer <token>" \
     -F "eventId=meeting-001" \
     -F "eventName=Team Meeting" \
     -F "location=Conference Room A" \
     -F "image=@group-photo.jpg"
   ```
   Expected: 200 status, identified list, processing time < 5000ms

2. **Retrieve Attendance Record**
   ```bash
   curl -X GET http://localhost:5000/api/group/attendance/meeting-001 \
     -H "Authorization: Bearer <token>"
   ```
   Expected: 200 status, attendance record with attendees

3. **View History**
   ```bash
   curl -X GET "http://localhost:5000/api/group/attendance/history?startDate=2024-01-01" \
     -H "Authorization: Bearer <token>"
   ```
   Expected: 200 status, array of records

4. **Verify in UI**
   - Navigate to Group Authentication
   - Upload group photo
   - Verify identified faces displayed
   - Check attendance history page

**Success Criteria:**
- ✓ Detects all faces in group
- ✓ Identifies registered individuals
- ✓ Creates attendance record
- ✓ Processing time < 5 seconds
- ✓ History retrieval works

#### 3. Crowd Counting Flow

**Test Case: Large Gathering Analysis**

1. **Count Crowd**
   ```bash
   curl -X POST http://localhost:5000/api/crowd/count \
     -H "Authorization: Bearer <token>" \
     -F "location=Stadium" \
     -F "eventName=Concert" \
     -F "image=@crowd-photo.jpg"
   ```
   Expected: 200 status, face count, density map, time < 3000ms

2. **Verify Accuracy**
   - Compare count with ground truth
   - Error should be <= 10%

3. **View History**
   ```bash
   curl -X GET "http://localhost:5000/api/crowd/history?location=Stadium" \
     -H "Authorization: Bearer <token>"
   ```
   Expected: 200 status, historical records

4. **Verify in UI**
   - Navigate to Crowd Counter
   - Upload crowd image
   - Verify count and heatmap display
   - Check accuracy indicator

**Success Criteria:**
- ✓ Counts faces accurately (within 10% error)
- ✓ Generates density heatmap
- ✓ Processing time < 3 seconds
- ✓ UI displays results correctly

## Performance Testing

### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run tests/load-test.yml
```

**load-test.yml:**
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  
scenarios:
  - name: "Individual Authentication"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/individual/authenticate"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Performance Benchmarks

Run benchmark tests:

```bash
cd backend
npm run benchmark
```

**Expected Results:**
- Individual auth: < 2 seconds (95th percentile)
- Group auth: < 5 seconds (95th percentile)
- Crowd counting: < 3 seconds (95th percentile)
- API response: < 500ms (excluding ML processing)
- Database queries: < 500ms

## Database Testing

### Query Performance

```javascript
// Test database query performance
const mongoose = require('mongoose');
const FaceProfile = require('./models/FaceProfile');

async function testQueryPerformance() {
  const start = Date.now();
  const profile = await FaceProfile.findOne({ userId: 'test-id' });
  const duration = Date.now() - start;
  
  console.log(`Query time: ${duration}ms`);
  // Should be < 500ms
}
```

### Scalability Testing

Test with 10,000+ registered users:

```bash
# Seed database with test data
node tests/seed-database.js --users=10000

# Run query tests
node tests/test-scalability.js
```

## Error Handling Tests

### Test Error Scenarios

1. **ML Service Unavailable**
   - Stop ML service
   - Attempt authentication
   - Verify graceful error handling

2. **Database Connection Lost**
   - Stop MongoDB
   - Attempt operations
   - Verify error messages

3. **Invalid Input**
   - Send malformed requests
   - Verify validation errors

4. **Rate Limiting**
   - Exceed rate limits
   - Verify 429 responses

## Security Testing

### Automated Security Scan

```bash
# Install OWASP ZAP or similar
# Run security scan
npm run security-scan
```

### Manual Security Tests

1. **Authentication Bypass**
   - Attempt to access protected endpoints without token
   - Try with invalid/expired tokens

2. **SQL/NoSQL Injection**
   - Test with malicious input
   - Verify sanitization

3. **XSS Protection**
   - Test with script tags in input
   - Verify escaping

4. **CSRF Protection**
   - Test cross-origin requests
   - Verify CORS configuration

## Test Reporting

### Generate Test Report

```bash
# Run all tests with reporting
npm test -- --reporters=default --reporters=jest-html-reporter

# View report
open test-report.html
```

### Continuous Integration

Add to CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Troubleshooting

### Common Issues

1. **Tests Timeout**
   - Increase Jest timeout: `jest.setTimeout(30000)`
   - Check ML services are running
   - Verify network connectivity

2. **Database Connection Errors**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database permissions

3. **ML Service Errors**
   - Check Python dependencies installed
   - Verify models are loaded
   - Check service logs

4. **Authentication Failures**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure user exists in database

## Best Practices

1. **Isolate Tests**
   - Use separate test database
   - Clean up after each test
   - Don't depend on test order

2. **Mock External Services**
   - Mock ML services when appropriate
   - Use test doubles for third-party APIs
   - Control test data

3. **Comprehensive Coverage**
   - Test happy paths
   - Test error cases
   - Test edge cases
   - Test performance

4. **Continuous Testing**
   - Run tests on every commit
   - Automate in CI/CD
   - Monitor test results
   - Fix failures immediately
