const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Content Management API Tests', () => {
  let authToken;
  let adminToken;
  let userId;
  let adminId;
  let summaryId;
  let toolId;
  let forumPostId;
  let courseId;

  beforeAll(async () => {
    // Create a test user and get auth token
    const userEmail = `contenttest${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Content Test User',
        email: userEmail,
        password: 'password123'
      });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;

    // Create an admin user
    const adminEmail = `admin${Date.now()}@example.com`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Admin Test User',
        email: adminEmail,
        password: 'password123'
      });

    adminToken = adminRes.body.token;
    adminId = adminRes.body.user.id;

    // Update admin user role
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' }
    });

    // Create a test course
    const course = await prisma.course.create({
      data: {
        courseCode: 'TEST101',
        courseName: 'Test Course',
        institution: 'Test University',
        semester: 'Fall 2024'
      }
    });
    courseId = course.id;
  });

  afterAll(async () => {
    // Clean up test data - delete in correct order to respect foreign key constraints
    if (forumPostId) {
      await prisma.forumPost.delete({ where: { id: forumPostId } }).catch(() => {});
    }
    if (summaryId) {
      await prisma.summary.delete({ where: { id: summaryId } }).catch(() => {});
    }
    if (toolId) {
      await prisma.tool.delete({ where: { id: toolId } }).catch(() => {});
    }
    if (courseId) {
      await prisma.course.delete({ where: { id: courseId } }).catch(() => {});
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    if (adminId) {
      await prisma.user.delete({ where: { id: adminId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // Summaries My Content Tests
  describe('GET /api/summaries/my-content', () => {
    beforeAll(async () => {
      // Create a test summary for the user
      const summary = await prisma.summary.create({
        data: {
          title: 'My Test Summary',
          description: 'Test description',
          filePath: 'test-path.pdf',
          courseId: courseId,
          uploadedById: userId
        }
      });
      summaryId = summary.id;
    });

    it('should get user\'s own summaries', async () => {
      const res = await request(app)
        .get('/api/summaries/my-content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title', 'My Test Summary');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/summaries/my-content');

      expect(res.statusCode).toBe(401);
    });
  });

  // Tools My Content Tests
  describe('GET /api/tools/my-content', () => {
    beforeAll(async () => {
      // Create a test tool for the user
      const tool = await prisma.tool.create({
        data: {
          title: 'My Test Tool',
          url: 'https://example.com/tool',
          description: 'Test tool description',
          category: 'מחשבונים',
          addedById: userId
        }
      });
      toolId = tool.id;
    });

    it('should get user\'s own tools', async () => {
      const res = await request(app)
        .get('/api/tools/my-content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title', 'My Test Tool');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/tools/my-content');

      expect(res.statusCode).toBe(401);
    });
  });

  // Forum My Posts Tests
  describe('GET /api/forum/my-posts', () => {
    beforeAll(async () => {
      // Create a test forum post for the user
      const post = await prisma.forumPost.create({
        data: {
          title: 'My Test Post',
          content: 'Test post content',
          courseId: courseId,
          authorId: userId
        }
      });
      forumPostId = post.id;
    });

    it('should get user\'s own forum posts', async () => {
      const res = await request(app)
        .get('/api/forum/my-posts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title', 'My Test Post');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/forum/my-posts');

      expect(res.statusCode).toBe(401);
    });
  });

  // Summary Update Tests
  describe('PUT /api/summaries/:id', () => {
    it('should update own summary', async () => {
      const res = await request(app)
        .put(`/api/summaries/${summaryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Summary Title',
          description: 'Updated description',
          courseId: courseId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'סיכום עודכן בהצלחה');
      expect(res.body.summary).toHaveProperty('title', 'Updated Summary Title');
    });

    it('should allow admin to update any summary', async () => {
      const res = await request(app)
        .put(`/api/summaries/${summaryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated Title',
          description: 'Admin updated description',
          courseId: courseId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.summary).toHaveProperty('title', 'Admin Updated Title');
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/api/summaries/${summaryId}`)
        .send({
          title: 'Unauthorized Update',
          courseId: courseId
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // Tool Update Tests
  describe('PUT /api/tools/:id', () => {
    it('should update own tool', async () => {
      const res = await request(app)
        .put(`/api/tools/${toolId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Tool Title',
          url: 'https://example.com/updated',
          description: 'Updated description',
          category: 'עדכון'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'כלי עודכן בהצלחה');
      expect(res.body.tool).toHaveProperty('title', 'Updated Tool Title');
    });

    it('should allow admin to update any tool', async () => {
      const res = await request(app)
        .put(`/api/tools/${toolId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated Tool',
          url: 'https://example.com/admin-updated',
          description: 'Admin updated',
          category: 'מנהל'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.tool).toHaveProperty('title', 'Admin Updated Tool');
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/api/tools/${toolId}`)
        .send({
          title: 'Unauthorized Update',
          url: 'https://example.com/unauthorized'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // Forum Post Update Tests
  describe('PUT /api/forum/:id', () => {
    it('should update own forum post', async () => {
      const res = await request(app)
        .put(`/api/forum/${forumPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Post Title',
          content: 'Updated post content',
          courseId: courseId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'פוסט עודכן בהצלחה');
      expect(res.body.post).toHaveProperty('title', 'Updated Post Title');
    });

    it('should allow admin to update any post', async () => {
      const res = await request(app)
        .put(`/api/forum/${forumPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated Post',
          content: 'Admin updated content',
          courseId: courseId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.post).toHaveProperty('title', 'Admin Updated Post');
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/api/forum/${forumPostId}`)
        .send({
          title: 'Unauthorized Update',
          content: 'Unauthorized content'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
