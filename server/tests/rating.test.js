const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Rating API Tests', () => {
  let token;
  let userId;
  let courseId;
  let summaryId;

  beforeAll(async () => {
    // Clean up test data
    await prisma.rating.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.summary.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'ratingtest' } }
    });

    // Create a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Rating Test User',
        email: 'ratingtest@example.com',
        password: 'password123'
      });

    token = registerRes.body.token;
    userId = registerRes.body.user.id;

    // Get or create a course
    let course = await prisma.course.findFirst();
    if (!course) {
      course = await prisma.course.create({
        data: {
          courseCode: 'TEST101',
          courseName: 'Test Course',
          institution: 'Test University',
          semester: 'א 2024'
        }
      });
    }
    courseId = course.id;

    // Create a test summary
    const summary = await prisma.summary.create({
      data: {
        title: 'Test Summary for Rating',
        description: 'A test summary',
        filePath: 'uploads/test-file.pdf',
        courseId: courseId,
        uploadedById: userId
      }
    });
    summaryId = summary.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.rating.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.summary.deleteMany({
      where: { id: summaryId }
    });
    await prisma.user.deleteMany({
      where: { email: 'ratingtest@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/summaries/:id/rate', () => {
    it('should rate a summary successfully', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('rating');
      expect(res.body).toHaveProperty('avgRating');
      expect(res.body).toHaveProperty('totalRatings');
      expect(res.body.rating.rating).toBe(5);
      expect(res.body.avgRating).toBe(5);
      expect(res.body.totalRatings).toBe(1);
    });

    it('should update existing rating', async () => {
      // First rating
      await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 3 });

      // Update rating
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.rating.rating).toBe(4);
      expect(res.body.avgRating).toBe(4);
    });

    it('should reject rating without authentication', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid rating value (below 1)', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 0 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid rating value (above 5)', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject missing rating', async () => {
      const res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent summary', async () => {
      const res = await request(app)
        .post('/api/summaries/99999/rate')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/summaries/:id', () => {
    it('should return summary with ratings including userId', async () => {
      // First, add a rating
      await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      // Get the summary
      const res = await request(app)
        .get(`/api/summaries/${summaryId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('ratings');
      expect(res.body.ratings.length).toBeGreaterThan(0);
      expect(res.body.ratings[0]).toHaveProperty('userId');
      expect(res.body.ratings[0]).toHaveProperty('rating');
      expect(res.body.ratings[0]).toHaveProperty('user');
    });

    it('should return avgRating after rating', async () => {
      const res = await request(app)
        .get(`/api/summaries/${summaryId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('avgRating');
      expect(typeof res.body.avgRating).toBe('number');
    });
  });

  describe('GET /api/summaries/:id/ratings', () => {
    it('should return all ratings for a summary', async () => {
      // First, add a rating
      await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4 });

      // Get ratings
      const res = await request(app)
        .get(`/api/summaries/${summaryId}/ratings`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('summaryId', summaryId);
      expect(res.body).toHaveProperty('avgRating');
      expect(res.body).toHaveProperty('totalRatings');
      expect(res.body).toHaveProperty('ratings');
      expect(Array.isArray(res.body.ratings)).toBe(true);
      expect(res.body.ratings.length).toBeGreaterThan(0);
      expect(res.body.ratings[0]).toHaveProperty('rating');
      expect(res.body.ratings[0]).toHaveProperty('user');
    });

    it('should return 404 for non-existent summary', async () => {
      const res = await request(app)
        .get('/api/summaries/99999/ratings');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Multi-user Rating Visibility', () => {
    let token2;
    let userId2;

    beforeAll(async () => {
      // Create a second test user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Rating Test User 2',
          email: 'ratingtest2@example.com',
          password: 'password123'
        });

      token2 = registerRes.body.token;
      userId2 = registerRes.body.user.id;
    });

    afterAll(async () => {
      // Clean up second user
      await prisma.user.deleteMany({
        where: { email: 'ratingtest2@example.com' }
      });
    });

    it('should show updated avgRating to all users after multiple ratings', async () => {
      // User 1 rates with 5 stars
      const rating1Res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      expect(rating1Res.statusCode).toBe(200);
      expect(rating1Res.body.avgRating).toBe(5);
      expect(rating1Res.body.totalRatings).toBe(1);

      // User 2 rates with 3 stars
      const rating2Res = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ rating: 3 });

      expect(rating2Res.statusCode).toBe(200);
      expect(rating2Res.body.avgRating).toBe(4); // (5 + 3) / 2 = 4
      expect(rating2Res.body.totalRatings).toBe(2);

      // Both users should see the same avgRating when fetching summary
      const summaryRes1 = await request(app)
        .get(`/api/summaries/${summaryId}`)
        .set('Authorization', `Bearer ${token}`);

      const summaryRes2 = await request(app)
        .get(`/api/summaries/${summaryId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(summaryRes1.statusCode).toBe(200);
      expect(summaryRes2.statusCode).toBe(200);
      expect(summaryRes1.body.avgRating).toBe(4);
      expect(summaryRes2.body.avgRating).toBe(4);
      expect(summaryRes1.body.ratings.length).toBe(2);
      expect(summaryRes2.body.ratings.length).toBe(2);
    });

    it('should show updated avgRating to unauthenticated users', async () => {
      // Unauthenticated user fetches summary
      const summaryRes = await request(app)
        .get(`/api/summaries/${summaryId}`);

      expect(summaryRes.statusCode).toBe(200);
      expect(summaryRes.body.avgRating).toBe(4); // Should match authenticated users
      expect(summaryRes.body.ratings.length).toBe(2);
    });

    it('should reflect rating updates in summary list', async () => {
      // User 1 updates their rating to 1 star
      const updateRes = await request(app)
        .post(`/api/summaries/${summaryId}/rate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 1 });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.avgRating).toBe(2); // (1 + 3) / 2 = 2
      expect(updateRes.body.totalRatings).toBe(2);

      // Fetch all summaries and verify avgRating is updated
      const summariesRes = await request(app)
        .get('/api/summaries');

      expect(summariesRes.statusCode).toBe(200);
      const summary = summariesRes.body.find((s: any) => s.id === summaryId);
      expect(summary).toBeDefined();
      expect(summary.avgRating).toBe(2);
    });
  });
});
