const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Summaries API Tests', () => {
  let authToken;
  let testUserId;
  let testCourseId;
  let testSummaryId;

  beforeAll(async () => {
    // Clean up test data
    await prisma.summary.deleteMany({
      where: { title: { contains: 'Test Summary' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { contains: 'TEST' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'summarytest@example.com' }
    });

    // Create test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Summary Test User',
        email: 'summarytest@example.com',
        password: 'password123'
      });

    authToken = registerRes.body.token;
    testUserId = registerRes.body.user.id;

    // Create test course
    const course = await prisma.course.create({
      data: {
        courseCode: 'TEST101',
        courseName: 'Test Course',
        institution: 'Test University',
        semester: 'Fall 2024'
      }
    });
    testCourseId = course.id;

    // Create test PDF file for upload tests
    const testPdfPath = path.join(__dirname, 'test-summary.pdf');
    if (!fs.existsSync(testPdfPath)) {
      // Create a minimal valid PDF file
      const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF');
      fs.writeFileSync(testPdfPath, pdfContent);
    }
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.summary.deleteMany({
      where: { title: { contains: 'Test Summary' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { contains: 'TEST' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'summarytest@example.com' }
    });

    // Clean up test PDF file
    const testPdfPath = path.join(__dirname, 'test-summary.pdf');
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }

    await prisma.$disconnect();
  });

  describe('POST /api/summaries - Upload Summary', () => {
    it('should upload a summary with valid data', async () => {
      const testPdfPath = path.join(__dirname, 'test-summary.pdf');

      const res = await request(app)
        .post('/api/summaries')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Summary Title')
        .field('description', 'Test summary description')
        .field('courseId', testCourseId.toString())
        .attach('file', testPdfPath);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'סיכום הועלה בהצלחה');
      expect(res.body.summary).toHaveProperty('title', 'Test Summary Title');
      expect(res.body.summary).toHaveProperty('description', 'Test summary description');
      expect(res.body.summary).toHaveProperty('filePath');
      expect(res.body.summary.course).toHaveProperty('courseCode', 'TEST101');

      testSummaryId = res.body.summary.id;
    });

    it('should reject upload without authentication', async () => {
      const testPdfPath = path.join(__dirname, 'test-summary.pdf');

      const res = await request(app)
        .post('/api/summaries')
        .field('title', 'Test Summary')
        .field('courseId', testCourseId.toString())
        .attach('file', testPdfPath);

      expect(res.statusCode).toBe(401);
    });

    it('should reject upload without file', async () => {
      const res = await request(app)
        .post('/api/summaries')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Summary Without File')
        .field('courseId', testCourseId.toString());

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'יש להעלות קובץ PDF');
    });

    it('should reject upload with missing title', async () => {
      const testPdfPath = path.join(__dirname, 'test-summary.pdf');

      const res = await request(app)
        .post('/api/summaries')
        .set('Authorization', `Bearer ${authToken}`)
        .field('courseId', testCourseId.toString())
        .attach('file', testPdfPath);

      expect(res.statusCode).toBe(400);
    });

    it('should reject upload with missing courseId', async () => {
      const testPdfPath = path.join(__dirname, 'test-summary.pdf');

      const res = await request(app)
        .post('/api/summaries')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Summary Title')
        .attach('file', testPdfPath);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/summaries - List Summaries', () => {
    it('should get all summaries', async () => {
      const res = await request(app).get('/api/summaries');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter summaries by courseId', async () => {
      const res = await request(app)
        .get(`/api/summaries?courseId=${testCourseId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(summary => {
        expect(summary.courseId).toBe(testCourseId);
      });
    });

    it('should search summaries by title', async () => {
      const res = await request(app)
        .get('/api/summaries?search=Test Summary');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/summaries/:id - Get Single Summary', () => {
    it('should get summary by id', async () => {
      const res = await request(app)
        .get(`/api/summaries/${testSummaryId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', testSummaryId);
      expect(res.body).toHaveProperty('title', 'Test Summary Title');
      expect(res.body).toHaveProperty('course');
      expect(res.body).toHaveProperty('uploadedBy');
    });

    it('should return 404 for non-existent summary', async () => {
      const res = await request(app)
        .get('/api/summaries/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'סיכום לא נמצא');
    });
  });

  describe('POST /api/summaries/:id/rate - Rate Summary', () => {
    it('should rate a summary', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'דירוג נשמר בהצלחה');
      expect(res.body).toHaveProperty('rating');
      expect(res.body).toHaveProperty('avgRating');
    });

    it('should update existing rating', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.rating.rating).toBe(4);
    });

    it('should reject invalid rating value', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject rating without authentication', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/rate`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/summaries/:id/comments - Add Comment', () => {
    it('should add a comment to summary', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Great summary!' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'תגובה נוספה בהצלחה');
      expect(res.body.comment).toHaveProperty('text', 'Great summary!');
      expect(res.body.comment).toHaveProperty('author');
    });

    it('should reject empty comment', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject comment without authentication', async () => {
      const res = await request(app)
        .post(`/api/summaries/${testSummaryId}/comments`)
        .send({ text: 'Test comment' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/summaries/:id - Delete Summary', () => {
    it('should reject deletion by non-owner', async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Other User',
          email: 'otheruser@example.com',
          password: 'password123'
        });

      const otherToken = otherUserRes.body.token;

      const res = await request(app)
        .delete(`/api/summaries/${testSummaryId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'אין לך הרשאה למחוק סיכום זה');

      // Clean up other user
      await prisma.user.delete({
        where: { email: 'otheruser@example.com' }
      });
    });

    it('should delete summary by owner', async () => {
      const res = await request(app)
        .delete(`/api/summaries/${testSummaryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'סיכום נמחק בהצלחה');
    });

    it('should return 404 for already deleted summary', async () => {
      const res = await request(app)
        .delete(`/api/summaries/${testSummaryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
