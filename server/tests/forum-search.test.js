const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/index');

const prisma = new PrismaClient();

describe('Forum Search and Filter API Tests', () => {
  let testUser;
  let testToken;
  let testCourse;
  let testPost1;
  let testPost2;
  let testPost3;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.forumPost.deleteMany({
      where: { title: { contains: 'ForumSearchTest' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { startsWith: 'FORUMSEARCH' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'forumsearchtest@example.com' }
    });

    // Create a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Forum Search Test User',
        email: 'forumsearchtest@example.com',
        password: 'password123'
      });

    testToken = registerRes.body.token;
    testUser = registerRes.body.user;

    // Create a test course
    testCourse = await prisma.course.create({
      data: {
        courseCode: 'FORUMSEARCH101',
        courseName: 'Introduction to Forum Searching',
        institution: 'Test University',
        semester: 'Fall 2024'
      }
    });

    // Create test forum posts with different categories
    testPost1 = await prisma.forumPost.create({
      data: {
        title: 'ForumSearchTest Post About Algorithms',
        content: 'This is a question about sorting algorithms and how they work in practice.',
        category: 'אלגוריתמים',
        tags: ['algorithms', 'sorting'],
        isAnswered: false,
        courseId: testCourse.id,
        authorId: testUser.id
      }
    });

    testPost2 = await prisma.forumPost.create({
      data: {
        title: 'ForumSearchTest Math Question',
        content: 'Can someone help me understand calculus derivatives better?',
        category: 'מתמטיקה',
        tags: ['math', 'calculus'],
        isAnswered: true,
        courseId: testCourse.id,
        authorId: testUser.id
      }
    });

    testPost3 = await prisma.forumPost.create({
      data: {
        title: 'ForumSearchTest General Discussion',
        content: 'Looking for study group partners for the upcoming exam.',
        category: 'כללי',
        tags: ['study', 'general'],
        isAnswered: false,
        courseId: testCourse.id,
        authorId: testUser.id
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.forumPost.deleteMany({
      where: { title: { contains: 'ForumSearchTest' } }
    });
    await prisma.course.deleteMany({
      where: { courseCode: { startsWith: 'FORUMSEARCH' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'forumsearchtest@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/forum - Search Forum Posts', () => {
    it('should search forum posts by title', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ search: 'Algorithms' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const foundPost = res.body.find(post => post.title.includes('ForumSearchTest Post About Algorithms'));
      expect(foundPost).toBeDefined();
    });

    it('should search forum posts by content', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ search: 'sorting algorithms' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const foundPost = res.body.find(post => post.content && post.content.includes('sorting algorithms'));
      expect(foundPost).toBeDefined();
    });

    it('should be case-insensitive search', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ search: 'calculus' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const foundPost = res.body.find(post => post.title.includes('ForumSearchTest Math Question'));
      expect(foundPost).toBeDefined();
    });

    it('should return empty array for non-matching search', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ search: 'NonExistentSearchTermForumTest12345' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const testPosts = res.body.filter(post => post.title.includes('ForumSearchTest'));
      expect(testPosts.length).toBe(0);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ category: 'אלגוריתמים' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const foundPost = res.body.find(post => post.id === testPost1.id);
      expect(foundPost).toBeDefined();
      expect(foundPost.category).toBe('אלגוריתמים');
    });

    it('should filter by answered status', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ answered: 'false' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Check that unanswered test posts are included
      const unansweredPost = res.body.find(post => post.id === testPost1.id);
      expect(unansweredPost).toBeDefined();
      expect(unansweredPost.isAnswered).toBe(false);
      
      // Check that answered test posts are excluded
      const answeredPost = res.body.find(post => post.id === testPost2.id);
      expect(answeredPost).toBeUndefined();
    });

    it('should filter by courseId', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ courseId: testCourse.id });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      res.body.forEach(post => {
        expect(post.courseId).toBe(testCourse.id);
      });
    });

    it('should combine search and category filters', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ 
          search: 'ForumSearchTest',
          category: 'מתמטיקה'
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const foundPost = res.body.find(post => post.id === testPost2.id);
      expect(foundPost).toBeDefined();
      expect(foundPost.category).toBe('מתמטיקה');
      expect(foundPost.title).toContain('ForumSearchTest');
    });

    it('should combine search and answered filters', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ 
          search: 'ForumSearchTest',
          answered: 'true'
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const foundPost = res.body.find(post => post.id === testPost2.id);
      expect(foundPost).toBeDefined();
      expect(foundPost.isAnswered).toBe(true);
      
      // Verify unanswered posts are not included
      const unansweredPost = res.body.find(post => post.id === testPost1.id);
      expect(unansweredPost).toBeUndefined();
    });

    it('should return all posts without any filters', async () => {
      const res = await request(app)
        .get('/api/forum');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should include at least our 3 test posts
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should include author and course information', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ search: 'ForumSearchTest' });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const post = res.body[0];
      expect(post).toHaveProperty('author');
      expect(post.author).toHaveProperty('fullName');
      expect(post).toHaveProperty('course');
      expect(post.course).toHaveProperty('courseCode');
      expect(post.course).toHaveProperty('courseName');
    });

    it('should include comment and rating counts', async () => {
      const res = await request(app)
        .get('/api/forum')
        .query({ search: 'ForumSearchTest' });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const post = res.body[0];
      expect(post).toHaveProperty('_count');
      expect(post._count).toHaveProperty('comments');
      expect(post._count).toHaveProperty('ratings');
    });
  });
});
