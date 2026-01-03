# Face Recognition and Crowd Analysis API Documentation

## Overview

This API provides three main capabilities:
1. Individual person authentication
2. Group authentication with attendance tracking
3. Large gathering face counting

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.facerecognition.com/api`

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require authentication using JWT tokens.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "user"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### GET /auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Individual Authentication

#### POST /individual/register
Register an individual with multiple facial images.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images`: Array of image files (minimum 5, maximum 10)
- `name`: Person's name (required)
- `age`: Person's age (optional)
- `gender`: Person's gender (optional)
- `department`: Person's department (optional)

**Response (201):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "faceId": "507f1f77bcf86cd799439012",
  "imagesCount": 5,
  "message": "Registration successful"
}
```

#### POST /individual/authenticate
Authenticate an individual using a single facial image.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: Single image file

**Response (200):**
```json
{
  "authenticated": true,
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "confidence": 0.95,
  "processingTime": 1850
}
```

#### GET /individual/:userId
Get face profile for a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "metadata": {
    "age": 30,
    "gender": "male",
    "department": "Engineering"
  },
  "faceImages": [...],
  "registeredAt": "2024-01-01T00:00:00.000Z",
  "lastAuthenticated": "2024-01-03T12:00:00.000Z"
}
```

#### DELETE /individual/:userId
Delete a user's face profile (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Group Authentication

#### POST /group/authenticate
Authenticate multiple individuals in a group photo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: Group photo file
- `eventId`: Event identifier (required)
- `eventName`: Event name (optional)
- `location`: Event location (optional)

**Response (200):**
```json
{
  "recordId": "507f1f77bcf86cd799439013",
  "totalFaces": 15,
  "identified": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "confidence": 0.92,
      "faceBox": {
        "x": 100,
        "y": 150,
        "width": 80,
        "height": 100
      }
    }
  ],
  "unidentified": 3,
  "processingTime": 4500
}
```

#### GET /group/attendance/:eventId
Get attendance record for a specific event.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "eventId": "event-2024-001",
  "eventName": "Team Meeting",
  "timestamp": "2024-01-03T10:00:00.000Z",
  "location": "Conference Room A",
  "attendees": [...],
  "totalFacesDetected": 15,
  "unidentifiedFaces": 3
}
```

#### GET /group/attendance/history
Get attendance history with optional filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)
- `userId`: Filter by specific user
- `eventId`: Filter by specific event
- `limit`: Maximum records to return (default: 100)

**Response (200):**
```json
{
  "records": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "eventId": "event-2024-001",
      "eventName": "Team Meeting",
      "timestamp": "2024-01-03T10:00:00.000Z",
      "attendees": [...],
      "totalFacesDetected": 15
    }
  ]
}
```

### Crowd Counting

#### POST /crowd/count
Count faces in a crowd image.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: Crowd photo file
- `location`: Location (optional)
- `eventName`: Event name (optional)
- `imageResolution`: Image resolution (optional)
- `weatherConditions`: Weather conditions (optional)

**Response (200):**
```json
{
  "recordId": "507f1f77bcf86cd799439014",
  "faceCount": 250,
  "accuracy": 0.88,
  "densityMap": "base64-encoded-image-data",
  "processingTime": 2800,
  "crowdDensity": "high"
}
```

#### GET /crowd/history
Get crowd counting history with optional filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)
- `location`: Filter by location
- `eventName`: Filter by event name
- `limit`: Maximum records to return (default: 100)

**Response (200):**
```json
{
  "records": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "faceCount": 250,
      "timestamp": "2024-01-03T14:00:00.000Z",
      "location": "Stadium",
      "estimatedAccuracy": 0.88,
      "crowdDensity": "high"
    }
  ]
}
```

### API Key Management

#### POST /keys/generate
Generate a new API key.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Application",
  "permissions": ["individual_auth", "group_auth", "crowd_count"],
  "expiresIn": 365
}
```

**Response (201):**
```json
{
  "key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "name": "My Application",
  "permissions": ["individual_auth", "group_auth", "crowd_count"],
  "expiresAt": "2025-01-03T00:00:00.000Z"
}
```

#### GET /keys
List all API keys for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "keys": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "My Application",
      "permissions": ["individual_auth", "group_auth"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastUsed": "2024-01-03T12:00:00.000Z"
    }
  ]
}
```

#### DELETE /keys/:keyId
Revoke an API key.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "API key revoked successfully"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2024-01-03T12:00:00.000Z"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `BAD_REQUEST` (400): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- General API endpoints: 100 requests per minute
- Authentication endpoints: 5 requests per 15 minutes

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: JPEG, PNG
- Individual registration: 5-10 images required
- Group/Crowd: Single image

## Performance Benchmarks

- Individual authentication: < 2 seconds
- Group authentication: < 5 seconds
- Crowd counting: < 3 seconds
- API response time (excluding ML): < 500ms
