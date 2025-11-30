const request = require('supertest');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Auth API Tests', () => {
  beforeAll(async () => {
    // Clean test database
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User 2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      token = res.body.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return profile fields', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bio');
      expect(res.body).toHaveProperty('location');
      expect(res.body).toHaveProperty('institution');
      expect(res.body).toHaveProperty('fieldOfStudy');
      expect(res.body).toHaveProperty('website');
      expect(res.body).toHaveProperty('interests');
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      token = res.body.token;
    });

    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'סטודנט למדעי המחשב',
          location: 'תל אביב',
          institution: 'אוניברסיטת תל אביב',
          fieldOfStudy: 'מדעי המחשב',
          interests: ['Python', 'AI']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.user).toHaveProperty('bio', 'סטודנט למדעי המחשב');
      expect(res.body.user).toHaveProperty('location', 'תל אביב');
      expect(res.body.user).toHaveProperty('institution', 'אוניברסיטת תל אביב');
      expect(res.body.user).toHaveProperty('fieldOfStudy', 'מדעי המחשב');
      expect(res.body.user.interests).toEqual(['Python', 'AI']);
    });

    it('should update fullName', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Updated Name'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('fullName', 'Updated Name');
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ bio: 'test' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject bio that is too long', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'a'.repeat(501) // More than 500 characters
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject too many interests', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          interests: Array(11).fill('interest') // More than 10 interests
        });

      expect(res.statusCode).toBe(400);
    });

    it('should accept empty string fields as optional', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Test User',
          bio: '',
          location: '',
          institution: '',
          fieldOfStudy: '',
          website: '',
          interests: []
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.user).toHaveProperty('fullName', 'Test User');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept valid email and return success message', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should return success even for non-existent email (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject empty email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeAll(async () => {
      // Create a reset token directly in the database for testing
      resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { email: 'test@example.com' },
        data: { resetToken, resetTokenExpiresAt }
      });
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verify login works with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword123'
        });

      expect(loginRes.statusCode).toBe(200);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject expired token', async () => {
      // Create an expired token
      const expiredToken = crypto.randomBytes(32).toString('hex');
      const expiredDate = new Date(Date.now() - 60000); // 1 minute ago

      await prisma.user.update({
        where: { email: 'test@example.com' },
        data: { resetToken: expiredToken, resetTokenExpiresAt: expiredDate }
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject short password', async () => {
      const newToken = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { email: 'test@example.com' },
        data: { 
          resetToken: newToken, 
          resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000) 
        }
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: newToken,
          password: '12345' // Less than 6 characters
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject empty token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});