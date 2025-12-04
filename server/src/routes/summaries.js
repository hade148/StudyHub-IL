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
    const andConditions = [];
    
    if (courseId) {
      andConditions.push({ courseId: parseInt(courseId) });
    }
    
    // Filter by institution
    if (institution) {
      andConditions.push({ course: { institution } });
    }
    
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { course: { courseName: { contains: search, mode: 'insensitive' } } },
          { course: { courseCode: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
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
        ratings: { 
          select: { 
            id: true, 
            rating: true, 
            userId: true, 
            user: { select: { fullName: true } } 
          } 
        },
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
    const summaryId = parseInt(id);

    // Check if summary exists
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    // Use transaction to ensure consistency between rating upsert and average update
    const result = await prisma.$transaction(async (tx) => {
      // Upsert rating
      const newRating = await tx.rating.upsert({
        where: {
          summaryId_userId: {
            summaryId: summaryId,
            userId: req.user.id
          }
        },
        update: { rating },
        create: {
          rating,
          summaryId: summaryId,
          userId: req.user.id
        }
      });

      // Calculate average rating using aggregate
      const aggregation = await tx.rating.aggregate({
        where: { summaryId: summaryId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      const avgRating = aggregation._avg.rating || 0;
      const totalRatings = aggregation._count.rating;

      // Update summary with new average
      await tx.summary.update({
        where: { id: summaryId },
        data: { avgRating }
      });

      return { newRating, avgRating, totalRatings };
    });

    res.json({
      message: 'דירוג נשמר בהצלחה',
      rating: result.newRating,
      avgRating: result.avgRating,
      totalRatings: result.totalRatings
    });
  } catch (error) {
    console.error('Rate summary error:', error);
    res.status(500).json({ error: 'שגיאה בדירוג סיכום' });
  }
});

// GET /api/summaries/:id/ratings - Get all ratings for a summary
router.get('/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    const summaryId = parseInt(id);

    // Check if summary exists
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
      select: { id: true, avgRating: true }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    // Get all ratings for this summary
    const ratings = await prisma.rating.findMany({
      where: { summaryId: summaryId },
      include: {
        user: { select: { id: true, fullName: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      summaryId: summaryId,
      avgRating: summary.avgRating,
      totalRatings: ratings.length,
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        date: r.date,
        userId: r.userId,
        user: r.user
      }))
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת דירוגים' });
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