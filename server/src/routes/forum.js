const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { forumPostValidation, commentValidation } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/forum - Get all forum posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { courseId, search, answered } = req.query;

    const where = {};
    if (courseId) where.courseId = parseInt(courseId);
    if (answered !== undefined) where.isAnswered = answered === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const posts = await prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, fullName: true } },
        course: { select: { courseCode: true, courseName: true } },
        _count: { select: { comments: true } }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת פוסטים' });
  }
});

// GET /api/forum/:id - Get single forum post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Increment views
    await prisma.forumPost.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });

    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        course: true,
        comments: {
          include: {
            author: { select: { id: true, fullName: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'פוסט לא נמצא' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת פוסט' });
  }
});

// POST /api/forum - Create new forum post
router.post('/', authenticate, forumPostValidation, async (req, res) => {
  try {
    const { title, content, courseId } = req.body;

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        courseId: parseInt(courseId),
        authorId: req.user.id
      },
      include: {
        author: { select: { fullName: true } },
        course: { select: { courseCode: true, courseName: true } }
      }
    });

    res.status(201).json({
      message: 'פוסט נוצר בהצלחה',
      post
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ error: 'שגיאה ביצירת פוסט' });
  }
});

// POST /api/forum/:id/comments - Add comment to forum post
router.post('/:id/comments', authenticate, commentValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await prisma.forumComment.create({
      data: {
        text,
        postId: parseInt(id),
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, fullName: true } }
      }
    });

    res.status(201).json({
      message: 'תגובה נוספה בהצלחה',
      comment
    });
  } catch (error) {
    console.error('Add forum comment error:', error);
    res.status(500).json({ error: 'שגיאה בהוספת תגובה' });
  }
});

// PATCH /api/forum/:id/answer - Mark post as answered
router.patch('/:id/answer', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'פוסט לא נמצא' });
    }

    // Only author or admin can mark as answered
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'אין לך הרשאה לעדכן פוסט זה' });
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id: parseInt(id) },
      data: { isAnswered: true }
    });

    res.json({
      message: 'הפוסט סומן כנענה',
      post: updatedPost
    });
  } catch (error) {
    console.error('Mark answered error:', error);
    res.status(500).json({ error: 'שגיאה בעדכון פוסט' });
  }
});

// DELETE /api/forum/:id - Delete forum post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'פוסט לא נמצא' });
    }

    // Check ownership or admin
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'אין לך הרשאה למחוק פוסט זה' });
    }

    await prisma.forumPost.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'פוסט נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת פוסט' });
  }
});

module.exports = router;