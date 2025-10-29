const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

const reportValidation = [
  body('postId').isInt({ min: 1 }).withMessage('פוסט לא תקין'),
  body('reason').trim().notEmpty().withMessage('סיבה היא שדה חובה'),
  validate
];

// POST /api/reports - Create report
router.post('/', authenticate, reportValidation, async (req, res) => {
  try {
    const { postId, reason } = req.body;

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ error: 'פוסט לא נמצא' });
    }

    const report = await prisma.report.create({
      data: {
        reason,
        postId: parseInt(postId),
        reporterId: req.user.id
      },
      include: {
        reporter: { select: { fullName: true } },
        post: { select: { title: true } }
      }
    });

    res.status(201).json({ message: 'דיווח נשלח בהצלחה', report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'שגיאה בשליחת דיווח' });
  }
});

// GET /api/reports - Get all reports (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        post: {
          include: {
            author: { select: { id: true, fullName: true } },
            course: { select: { courseName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת דיווחים' });
  }
});

// PATCH /api/reports/:id/status - Update report status (admin only)
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'סטטוס לא תקין' });
    }

    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ message: 'סטטוס דיווח עודכן', report });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'שגיאה בעדכון דיווח' });
  }
});

module.exports = router;