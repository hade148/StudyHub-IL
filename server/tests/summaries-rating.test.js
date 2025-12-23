const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Summary Rating API Tests', () => {
  let authToken;
  let userId;
  let summaryId;
  let courseId;

  beforeAll(async () => {
    // Create a test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Rating Test User',
        email: `rating-test-${Date.now()}@example.com`,
        password: 'password123'
      });

    authToken = userRes.body.token;
    userId = userRes.body.user.id;

    // Create or get a test course
    const course = await prisma.course.upsert({
      where: { courseCode: 'TEST101' },
      update: {},
      create: {
        courseCode: 'TEST101',
        courseName: 'Test Course',
        institution: 'Test University',
        semester: 'Fall 2024'
      }
    });
    courseId = course.id;

    // Create a test summary
    const summary = await prisma.summary.create({
      data: {
        title: 'Test Summary for Rating',
        description: 'This is a test summary',
        filePath: 'test.pdf',
        courseId: courseId,
        uploadedById: userId
      }
    });
    summaryId = summary.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.rating.deleteMany({
      where: { summaryId }
    });
    await prisma.summary.deleteMany({
      where: { id: summaryId }
    });
    await prisma.user.deleteMany({
      where: { id: userId }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/summaries/:id/rate', () => {
    it('should rate a summary successfully', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('avgRating');
      expect(res.body.avgRating).toBe(5);
    });

    it('should update existing rating', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.avgRating).toBe(4);
    });

    it('should reject rating without authentication', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid rating value', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 6 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/summaries/:id/ratings', () => {
    it('should get ratings for a summary', async () => {
      const res = await request(app)
        .get(`/api/summaries/${summaryId}/ratings`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('ratings');
      expect(res.body).toHaveProperty('avgRating');
      expect(res.body).toHaveProperty('userRating');
      expect(res.body).toHaveProperty('totalRatings');
      expect(res.body.totalRatings).toBeGreaterThan(0);
    });

    it('should work without authentication', async () => {
      const res = await request(app)
        .get(`/api/summaries/${summaryId}/ratings`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('ratings');
      expect(res.body.userRating).toBeNull();
    });
  });
});
