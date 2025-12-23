const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock Express app setup
const express = require('express');
const toolsRouter = require('../src/routes/tools');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use('/api/tools', toolsRouter);

describe('Tool Rating API', () => {
  let testUser;
  let testTool;
  let authToken;

  beforeAll(async () => {
    // Create a test user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    
    testUser = await prisma.user.create({
      data: {
        fullName: 'Test User',
        email: `test-${Date.now()}@example.com`,
        passwordHash: hashedPassword,
      },
    });

    // Create a test tool
    testTool = await prisma.tool.create({
      data: {
        title: 'Test Tool',
        url: 'https://example.com',
        description: 'A test tool',
        category: 'מחשבונים',
        addedById: testUser.id,
      },
    });

    // Generate auth token (simplified - in real app use JWT)
    authToken = 'mock-token';
  });

  afterAll(async () => {
    // Cleanup
    if (testTool) {
      await prisma.toolRating.deleteMany({ where: { toolId: testTool.id } });
      await prisma.tool.delete({ where: { id: testTool.id } });
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/tools/:id/rate', () => {
    it('should rate a tool successfully', async () => {
      const response = await request(app)
        .post(`/api/tools/${testTool.id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('rating');
      expect(response.body).toHaveProperty('avgRating');
      expect(response.body.rating.rating).toBe(5);
    });

    it('should update existing rating', async () => {
      // First rating
      await request(app)
        .post(`/api/tools/${testTool.id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 3 });

      // Update rating
      const response = await request(app)
        .post(`/api/tools/${testTool.id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4 });

      expect(response.status).toBe(200);
      expect(response.body.rating.rating).toBe(4);
    });

    it('should reject rating without authentication', async () => {
      const response = await request(app)
        .post(`/api/tools/${testTool.id}/rate`)
        .send({ rating: 5 });

      expect(response.status).toBe(401);
    });

    it('should reject invalid rating value', async () => {
      const response = await request(app)
        .post(`/api/tools/${testTool.id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 6 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tools/:id/ratings', () => {
    it('should get ratings for a tool', async () => {
      const response = await request(app).get(`/api/tools/${testTool.id}/ratings`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ratings');
      expect(response.body).toHaveProperty('avgRating');
      expect(response.body).toHaveProperty('totalRatings');
      expect(Array.isArray(response.body.ratings)).toBe(true);
    });

    it('should work without authentication', async () => {
      const response = await request(app).get(`/api/tools/${testTool.id}/ratings`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userRating');
      expect(response.body.userRating).toBeNull();
    });
  });

  describe('GET /api/tools', () => {
    it('should include rating count in tools list', async () => {
      const response = await request(app).get('/api/tools');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      const tool = response.body.find(t => t.id === testTool.id);
      expect(tool).toHaveProperty('ratingCount');
    });
  });
});
