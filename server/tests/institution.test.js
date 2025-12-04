const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Institution Filter API Tests', () => {
  let testUser;
  let testToken;
  let testCourse1;
  let testCourse2;
  let testSummary1;
  let testSummary2;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.summary.deleteMany({
      where: { title: { contains: 'InstitutionTest' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { startsWith: 'INST' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'institutiontest@example.com' }
    });

    // Create a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Institution Test User',
        email: 'institutiontest@example.com',
        password: 'password123'
      });

    testToken = registerRes.body.token;
    testUser = registerRes.body.user;

    // Create test courses with different institutions
    testCourse1 = await prisma.course.create({
      data: {
        courseCode: 'INST101',
        courseName: 'Test Course Hebrew University',
        institution: 'האוניברסיטה העברית',
        semester: 'Fall 2024'
      }
    });

    testCourse2 = await prisma.course.create({
      data: {
        courseCode: 'INST102',
        courseName: 'Test Course Technion',
        institution: 'הטכניון',
        semester: 'Fall 2024'
      }
    });

    // Create test summaries for each course
    testSummary1 = await prisma.summary.create({
      data: {
        title: 'InstitutionTest Summary Hebrew University',
        description: 'A test summary for Hebrew University',
        filePath: 'uploads/test-file1.pdf',
        courseId: testCourse1.id,
        uploadedById: testUser.id
      }
    });

    testSummary2 = await prisma.summary.create({
      data: {
        title: 'InstitutionTest Summary Technion',
        description: 'A test summary for Technion',
        filePath: 'uploads/test-file2.pdf',
        courseId: testCourse2.id,
        uploadedById: testUser.id
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.summary.deleteMany({
      where: { title: { contains: 'InstitutionTest' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { startsWith: 'INST' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'institutiontest@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/courses/institutions - Get institutions list', () => {
    it('should return a list of unique institutions', async () => {
      const res = await request(app)
        .get('/api/courses/institutions');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain('האוניברסיטה העברית');
      expect(res.body).toContain('הטכניון');
    });

    it('should return institutions in alphabetical order', async () => {
      const res = await request(app)
        .get('/api/courses/institutions');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Check that array is sorted
      const sorted = [...res.body].sort();
      expect(res.body).toEqual(sorted);
    });
  });

  describe('GET /api/courses - Filter courses by institution', () => {
    it('should filter courses by institution', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ institution: 'האוניברסיטה העברית' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All returned courses should be from the Hebrew University
      res.body.forEach(course => {
        expect(course.institution).toBe('האוניברסיטה העברית');
      });
    });

    it('should filter courses by Technion institution', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ institution: 'הטכניון' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All returned courses should be from Technion
      res.body.forEach(course => {
        expect(course.institution).toBe('הטכניון');
      });
    });

    it('should return all courses when no institution filter', async () => {
      const res = await request(app)
        .get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Should contain courses from both institutions
      const institutions = new Set(res.body.map(c => c.institution));
      expect(institutions.size).toBeGreaterThan(1);
    });

    it('should return empty array for non-existent institution', async () => {
      const res = await request(app)
        .get('/api/courses')
        .query({ institution: 'NonExistentUniversity12345' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /api/summaries - Filter summaries by institution', () => {
    it('should filter summaries by institution', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ institution: 'האוניברסיטה העברית' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All returned summaries should be from courses at Hebrew University
      res.body.forEach(summary => {
        expect(summary.course.institution).toBe('האוניברסיטה העברית');
      });
    });

    it('should filter summaries by Technion institution', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ institution: 'הטכניון' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All returned summaries should be from courses at Technion
      res.body.forEach(summary => {
        expect(summary.course.institution).toBe('הטכניון');
      });
    });

    it('should return summaries with institution field included', async () => {
      const res = await request(app)
        .get('/api/summaries');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      if (res.body.length > 0) {
        // Verify institution field is included in course
        expect(res.body[0].course).toHaveProperty('institution');
      }
    });

    it('should return empty array for non-existent institution', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ institution: 'NonExistentUniversity12345' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should combine institution filter with search', async () => {
      const res = await request(app)
        .get('/api/summaries')
        .query({ 
          institution: 'האוניברסיטה העברית',
          search: 'InstitutionTest'
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      res.body.forEach(summary => {
        expect(summary.course.institution).toBe('האוניברסיטה העברית');
        expect(summary.title).toContain('InstitutionTest');
      });
    });
  });
});
