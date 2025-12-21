const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Tools API Tests', () => {
  let authToken;
  let userId;
  let toolId;

  beforeAll(async () => {
    // Create a test user and get auth token
    const userEmail = `tooltest${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Tool Test User',
        email: userEmail,
        password: 'password123'
      });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (toolId) {
      await prisma.tool.deleteMany({
        where: { id: toolId }
      });
    }
    if (userId) {
      await prisma.user.deleteMany({
        where: { id: userId }
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/tools', () => {
    it('should create a new tool with authentication', async () => {
      const res = await request(app)
        .post('/api/tools')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Calculator',
          url: 'https://example.com/calculator',
          description: 'A test calculator tool',
          category: 'מחשבונים'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'כלי נוסף בהצלחה');
      expect(res.body.tool).toHaveProperty('title', 'Test Calculator');
      expect(res.body.tool).toHaveProperty('url', 'https://example.com/calculator');
      toolId = res.body.tool.id;
    });

    it('should reject tool creation without authentication', async () => {
      const res = await request(app)
        .post('/api/tools')
        .send({
          title: 'Test Tool',
          url: 'https://example.com/tool',
          description: 'Test description',
          category: 'מחשבונים'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject tool creation with invalid URL', async () => {
      const res = await request(app)
        .post('/api/tools')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Tool',
          url: 'not-a-valid-url',
          description: 'Test description',
          category: 'מחשבונים'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/tools', () => {
    it('should get all tools without authentication', async () => {
      const res = await request(app)
        .get('/api/tools');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get tools with favorite status when authenticated', async () => {
      const res = await request(app)
        .get('/api/tools')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('isFavorite');
      }
    });

    it('should filter tools by category', async () => {
      const res = await request(app)
        .get('/api/tools?category=מחשבונים');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(tool => {
        expect(tool.category).toBe('מחשבונים');
      });
    });
  });

  describe('GET /api/tools/:id', () => {
    it('should get a specific tool', async () => {
      if (!toolId) {
        // Create a tool first if not exists
        const createRes = await request(app)
          .post('/api/tools')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Tool for Get',
            url: 'https://example.com/test',
            description: 'Test',
            category: 'אחר'
          });
        toolId = createRes.body.tool.id;
      }

      const res = await request(app)
        .get(`/api/tools/${toolId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', toolId);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('url');
    });

    it('should return 404 for non-existent tool', async () => {
      const res = await request(app)
        .get('/api/tools/999999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/favorites/tool/:id', () => {
    it('should add tool to favorites', async () => {
      if (!toolId) {
        // Create a tool first if not exists
        const createRes = await request(app)
          .post('/api/tools')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Tool for Favorite',
            url: 'https://example.com/favorite',
            description: 'Test',
            category: 'אחר'
          });
        toolId = createRes.body.tool.id;
      }

      const res = await request(app)
        .post(`/api/favorites/tool/${toolId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'נוסף למועדפים');
    });

    it('should reject duplicate favorite', async () => {
      const res = await request(app)
        .post(`/api/favorites/tool/${toolId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'כבר במועדפים');
    });
  });

  describe('DELETE /api/favorites/tool/:id', () => {
    it('should remove tool from favorites', async () => {
      const res = await request(app)
        .delete(`/api/favorites/tool/${toolId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'הוסר מהמועדפים');
    });
  });

  describe('GET /api/favorites', () => {
    it('should get user favorites', async () => {
      // Add a tool to favorites first
      if (toolId) {
        await request(app)
          .post(`/api/favorites/tool/${toolId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const res = await request(app)
        .get('/api/favorites');

      expect(res.statusCode).toBe(401);
    });
  });
});
