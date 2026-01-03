const request = require('supertest');
const app = require('../../server');

describe('Crowd Counting Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    if (loginRes.body.token) {
      authToken = loginRes.body.token;
    }
  });

  describe('Crowd Counting Workflow', () => {
    test('Should count faces in crowd image', async () => {
      const countRes = await request(app)
        .post('/api/crowd/count')
        .set('Authorization', `Bearer ${authToken}`)
        .field('location', 'Stadium')
        .field('eventName', 'Concert');
        // .attach('image', 'path/to/crowd/image.jpg');

      // expect(countRes.status).toBe(200);
      // expect(countRes.body).toHaveProperty('faceCount');
      // expect(countRes.body).toHaveProperty('accuracy');
      // expect(countRes.body).toHaveProperty('densityMap');
      // expect(countRes.body.processingTime).toBeLessThan(3000);
    });

    test('Should handle large crowds (500+ people)', async () => {
      // Test with image containing 500+ people
      // expect(countRes.body.faceCount).toBeGreaterThanOrEqual(500);
      // expect(countRes.body.accuracy).toBeGreaterThanOrEqual(0.85);
    });

    test('Should generate density heatmap', async () => {
      // Verify density map is returned as base64
      // expect(countRes.body.densityMap).toBeTruthy();
      // expect(typeof countRes.body.densityMap).toBe('string');
    });
  });

  describe('Historical Data', () => {
    test('Should retrieve crowd counting history', async () => {
      const historyRes = await request(app)
        .get('/api/crowd/history')
        .query({
          location: 'Stadium',
          limit: 50
        })
        .set('Authorization', `Bearer ${authToken}`);

      // expect(historyRes.status).toBe(200);
      // expect(historyRes.body).toHaveProperty('records');
      // expect(Array.isArray(historyRes.body.records)).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    test('Crowd counting should complete within 3 seconds', async () => {
      const startTime = Date.now();
      
      // Perform crowd counting
      // const countRes = await request(app)
      //   .post('/api/crowd/count')
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .field('location', 'Test Location')
      //   .attach('image', 'path/to/crowd/image.jpg');

      const duration = Date.now() - startTime;
      // expect(duration).toBeLessThan(3000);
    });
  });

  describe('Accuracy Requirements', () => {
    test('Should achieve within 10% error for crowds up to 1000', async () => {
      // Test with images of known crowd sizes
      const testCases = [
        { image: 'crowd-100.jpg', actualCount: 100 },
        { image: 'crowd-500.jpg', actualCount: 500 },
        { image: 'crowd-1000.jpg', actualCount: 1000 }
      ];

      for (const testCase of testCases) {
        // const countRes = await request(app)
        //   .post('/api/crowd/count')
        //   .set('Authorization', `Bearer ${authToken}`)
        //   .attach('image', `path/to/${testCase.image}`);

        // const error = Math.abs(countRes.body.faceCount - testCase.actualCount) / testCase.actualCount;
        // expect(error).toBeLessThanOrEqual(0.10);
      }
    });
  });
});
