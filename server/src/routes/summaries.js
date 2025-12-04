const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { summaryValidation, ratingValidation, commentValidation } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'summary-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי PDF מותרים'));
    }
  }
});

// GET /api/summaries - Get all summaries with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { courseId, search, sortBy = 'recent', institution } = req.query;

    const where = {};
    if (courseId) where.courseId = parseInt(courseId);
    
    // Filter by institution
    if (institution) {
      where.course = { institution };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { course: { courseName: { contains: search, mode: 'insensitive' } } },
        { course: { courseCode: { contains: search, mode: 'insensitive' } } }
      ];
    }

    let orderBy = { uploadDate: 'desc' };
    if (sortBy === 'rating') orderBy = { avgRating: 'desc' };
    if (sortBy === 'title') orderBy = { title: 'asc' };

    const summaries = await prisma.summary.findMany({
      where,
      orderBy,
      include: {
        course: { select: { courseCode: true, courseName: true, institution: true } },
        uploadedBy: { select: { id: true, fullName: true } },
        _count: { select: { ratings: true, comments: true } }
      }
    });

    res.json(summaries);
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סיכומים' });
  }
});

// GET /api/summaries/:id - Get single summary
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true,
        uploadedBy: { select: { id: true, fullName: true, email: true } },
        ratings: { include: { user: { select: { fullName: true } } } },
        comments: {
          include: { author: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סיכום' });
  }
});

// POST /api/summaries - Upload new summary
router.post('/', authenticate, upload.single('file'), summaryValidation, async (req, res) => {
  try {
    const { title, description, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'יש להעלות קובץ PDF' });
    }

    const summary = await prisma.summary.create({
      data: {
        title,
        description,
        filePath: `uploads/${req.file.filename}`,
        courseId: parseInt(courseId),
        uploadedById: req.user.id
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        uploadedBy: { select: { fullName: true } }
      }
    });

    res.status(201).json({
      message: 'סיכום הועלה בהצלחה',
      summary
    });
  } catch (error) {
    console.error('Upload summary error:', error);
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'שגיאה בהעלאת סיכום' });
  }
});

// DELETE /api/summaries/:id - Delete summary
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: parseInt(id) }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    // Check ownership or admin
    if (summary.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'אין לך הרשאה למחוק סיכום זה' });
    }

    // Delete file
    const filePath = path.join(__dirname, '../../', summary.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.summary.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'סיכום נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת סיכום' });
  }
});

// POST /api/summaries/:id/rate - Rate a summary
router.post('/:id/rate', authenticate, ratingValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Upsert rating
    const newRating = await prisma.rating.upsert({
      where: {
        summaryId_userId: {
          summaryId: parseInt(id),
          userId: req.user.id
        }
      },
      update: { rating },
      create: {
        rating,
        summaryId: parseInt(id),
        userId: req.user.id
      }
    });

    // Update average rating
    const ratings = await prisma.rating.findMany({
      where: { summaryId: parseInt(id) }
    });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await prisma.summary.update({
      where: { id: parseInt(id) },
      data: { avgRating }
    });

    res.json({
      message: 'דירוג נשמר בהצלחה',
      rating: newRating,
      avgRating
    });
  } catch (error) {
    console.error('Rate summary error:', error);
    res.status(500).json({ error: 'שגיאה בדירוג סיכום' });
  }
});

// POST /api/summaries/:id/comments - Add comment to summary
router.post('/:id/comments', authenticate, commentValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await prisma.comment.create({
      data: {
        text,
        summaryId: parseInt(id),
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
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'שגיאה בהוספת תגובה' });
  }
});

module.exports = router;