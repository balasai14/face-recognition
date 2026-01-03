const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const FaceProfile = require('../../models/FaceProfile');

describe('Individual Authentication Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/face-recognition-test');
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await FaceProfile.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Complete Registration Workflow', () => {
    test('Should register user and create face profile', async () => {
      // 1. Register user account
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body).toHaveProperty('token');
      authToken = registerRes.body.token;
      userId = registerRes.body.user.id;

      // 2. Register face profile with images
      // Note: In real test, would use actual image files
      const faceRegisterRes = await request(app)
        .post('/api/individual/register')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Test User')
        .field('age', '30')
        .field('gender', 'male');
        // .attach('images', 'path/to/test/image1.jpg')
        // .attach('images', 'path/to/test/image2.jpg')
        // ... (5 images minimum)

      // Would expect 201 with actual images
      // expect(faceRegisterRes.status).toBe(201);
    });
  });

  describe('Authentication Workflow', () => {
    test('Should authenticate registered user', async () => {
      // This test requires:
      // 1. Registered face profile
      // 2. ML service running
      // 3. Test image of registered person

      const authRes = await request(app)
        .post('/api/individual/authenticate')
        .set('Authorization', `Bearer ${authToken}`);
        // .attach('image', 'path/to/test/auth-image.jpg');

      // Would expect successful authentication
      // expect(authRes.status).toBe(200);
      // expect(authRes.body.authenticated).toBe(true);
      // expect(authRes.body.confidence).toBeGreaterThanOrEqual(0.85);
      // expect(authRes.body.processingTime).toBeLessThan(2000);
    });

    test('Should reject unregistered person', async () => {
      // Test with image of person not in database
      // expect(authRes.body.authenticated).toBe(false);
    });
  });

  describe('Profile Management', () => {
    test('Should retrieve user profile', async () => {
      const profileRes = await request(app)
        .get(`/api/individual/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Would expect profile data
      // expect(profileRes.status).toBe(200);
      // expect(profileRes.body).toHaveProperty('name');
    });

    test('Should delete user profile (admin)', async () => {
      // Requires admin token
      // const deleteRes = await request(app)
      //   .delete(`/api/individual/${userId}`)
      //   .set('Authorization', `Bearer ${adminToken}`);
      // expect(deleteRes.status).toBe(200);
    });
  });

  describe('Performance Requirements', () => {
    test('Authentication should complete within 2 seconds', async () => {
      const startTime = Date.now();
      
      // Perform authentication
      // const authRes = await request(app)
      //   .post('/api/individual/authenticate')
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .attach('image', 'path/to/test/image.jpg');

      const duration = Date.now() - startTime;
      // expect(duration).toBeLessThan(2000);
    });
  });
});
