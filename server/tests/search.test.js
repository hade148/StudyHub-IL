const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Search API Tests', () => {
  let testUser;
  let testToken;
  let testCourse;
  let testSummary;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.summary.deleteMany({
      where: { title: { contains: 'SearchTest' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { startsWith: 'SEARCH' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'searchtest@example.com' }
    });

    // Create a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Search Test User',
        email: 'searchtest@example.com',
        password: 'password123'
      });

    testToken = registerRes.body.token;
    testUser = registerRes.body.user;

    // Create a test course
    testCourse = await prisma.course.create({
      data: {
        courseCode: 'SEARCH101',
        courseName: 'Introduction to Searching Algorithms',
        institution: 'Test University',
        semester: 'Fall 2024'
      }
    });

    // Create a test summary
    testSummary = await prisma.summary.create({
      data: {
        title: 'SearchTest Summary for Algorithms',
        description: 'A comprehensive guide to search algorithms',
        filePath: 'uploads/test-file.pdf',
        courseId: testCourse.id,
        uploadedById: testUser.id
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.summary.deleteMany({
      where: { title: { contains: 'SearchTest' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { startsWith: 'SEARCH' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'searchtest@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/summaries - Search Summaries', () => {
    it('should search summaries by title', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ search: 'SearchTest' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toContain('SearchTest');
    });

    it('should search summaries by description', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ search: 'comprehensive guide' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should search summaries by course name', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ search: 'Searching Algorithms' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].course.courseName).toContain('Searching Algorithms');
    });

    it('should search summaries by course code', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ search: 'SEARCH101' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].course.courseCode).toBe('SEARCH101');
    });

    it('should return empty array for non-matching search', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ search: 'NonExistentSearchTerm12345' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should be case-insensitive search', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ search: 'searchtest' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by courseId', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ courseId: testCourse.id });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].courseId).toBe(testCourse.id);
    });

    it('should sort by rating', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ sortBy: 'rating' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should sort by title', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ sortBy: 'title' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/courses - Search Courses', () => {
    it('should search courses by name', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ search: 'Searching Algorithms' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].courseName).toContain('Searching Algorithms');
    });

    it('should search courses by course code', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ search: 'SEARCH101' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].courseCode).toBe('SEARCH101');
    });

    it('should search courses by institution', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ search: 'Test University' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching search', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ search: 'NonExistentCourseName12345' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should be case-insensitive search', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ search: 'searching algorithms' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return all courses without search query', async () => {
      const res = await request(app)
        .get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should include summary and forum post counts', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ search: 'SEARCH101' });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('_count');
      expect(res.body[0]._count).toHaveProperty('summaries');
      expect(res.body[0]._count).toHaveProperty('forumPosts');
    });
  });
});
