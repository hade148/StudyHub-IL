const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { forumPostValidation, forumRatingValidation, commentValidation } = require('../middleware/validation');
const azureStorage = require('../utils/azureStorage');

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for image uploads
const storage = multer.memoryStorage(); // Use memory storage for Azure

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי תמונה מותרים (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// GET /api/forum - Get all forum posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { courseId, search, answered, category, myQuestions } = req.query;

    const where = {};
    if (courseId) where.courseId = parseInt(courseId);
    if (answered !== undefined) where.isAnswered = answered === 'true';
    if (category) where.category = category;
    
    // Filter by current user's questions
    if (myQuestions === 'true' && req.user) {
      where.authorId = req.user.id;
    }
    
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
        _count: { select: { comments: true, ratings: true } }
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
        },
        _count: { select: { ratings: true } }
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

// POST /api/forum - Create new forum post with optional images
router.post('/', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content, courseId, category, tags, isUrgent } = req.body;

    // Validate required fields
    if (!title || title.trim().length < 10 || title.trim().length > 150) {
      return res.status(400).json({ error: 'כותרת חייבת להכיל בין 10 ל-150 תווים' });
    }

    if (!content || content.trim().length < 50) {
      return res.status(400).json({ error: 'תוכן חייב להכיל לפחות 50 תווים' });
    }

    if (!courseId || isNaN(parseInt(courseId))) {
      return res.status(400).json({ error: 'קורס הוא שדה חובה' });
    }

    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Upload images to Azure Storage if any
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        if (azureStorage.isConfigured()) {
          for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const timestamp = Date.now();
            const fileExt = path.extname(file.originalname);
            const fileName = `forum/${timestamp}-${i}${fileExt}`;
            const imageUrl = await azureStorage.uploadFile(file.buffer, fileName, file.mimetype);
            imageUrls.push(imageUrl);
          }
        } else {
          console.warn('Azure Storage not configured, skipping image upload');
        }
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        return res.status(500).json({ error: 'שגיאה בהעלאת תמונות' });
      }
    }

    const post = await prisma.forumPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || null,
        tags: parsedTags,
        images: imageUrls,
        isUrgent: isUrgent === 'true' || isUrgent === true,
        courseId: parseInt(courseId),
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, fullName: true } },
        course: { select: { courseCode: true, courseName: true } }
      }
    });

    res.status(201).json({
      message: 'השאלה נוצרה בהצלחה',
      post
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ error: 'שגיאה ביצירת שאלה' });
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

    // Delete images from Azure Storage if any
    if (post.images && post.images.length > 0 && azureStorage.isConfigured()) {
      for (const imageUrl of post.images) {
        try {
          const blobName = azureStorage.extractBlobName(imageUrl);
          await azureStorage.deleteFile(blobName);
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
          // Continue with deletion even if image deletion fails
        }
      }
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

// POST /api/forum/:id/ratings - Rate a forum post
router.post('/:id/ratings', authenticate, forumRatingValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'פוסט לא נמצא' });
    }

    // Create or update rating
    const forumRating = await prisma.forumRating.upsert({
      where: {
        postId_userId: {
          postId: parseInt(id),
          userId: req.user.id
        }
      },
      update: {
        rating: parseInt(rating)
      },
      create: {
        rating: parseInt(rating),
        postId: parseInt(id),
        userId: req.user.id
      }
    });

    // Calculate average rating
    const ratings = await prisma.forumRating.findMany({
      where: { postId: parseInt(id) }
    });

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    // Update post with average rating
    await prisma.forumPost.update({
      where: { id: parseInt(id) },
      data: { avgRating }
    });

    res.status(201).json({
      message: 'דירוג נשמר בהצלחה',
      rating: forumRating,
      avgRating
    });
  } catch (error) {
    console.error('Rate forum post error:', error);
    res.status(500).json({ error: 'שגיאה בשמירת דירוג' });
  }
});

// GET /api/forum/:id/ratings - Get ratings for a forum post
router.get('/:id/ratings', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await prisma.forumRating.findMany({
      where: { postId: parseInt(id) },
      include: {
        user: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;

    let userRating = null;
    if (req.user) {
      const rating = ratings.find(r => r.userId === req.user.id);
      userRating = rating ? rating.rating : null;
    }

    res.json({
      ratings,
      avgRating,
      userRating,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Get forum post ratings error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת דירוגים' });
  }
});

module.exports = router;