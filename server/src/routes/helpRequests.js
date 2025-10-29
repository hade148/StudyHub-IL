const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Validation for help requests
const helpRequestValidation = [
  body('title').trim().notEmpty().withMessage('כותרת היא שדה חובה'),
  body('details').optional().trim(),
  body('courseId').notEmpty().isInt({ min: 1 }).withMessage('קורס הוא שדה חובה'),
  validate
];

// GET /api/help-requests - Get all help requests
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { courseId, status } = req.query;

    const where = {};
    if (courseId) where.courseId = parseInt(courseId);
    if (status) where.status = status;

    const requests = await prisma.helpRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, fullName: true } },
        course: { select: { courseCode: true, courseName: true } }
      }
    });

    res.json(requests);
  } catch (error) {
    console.error('Get help requests error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת בקשות עזרה' });
  }
});

// POST /api/help-requests - Create new help request
router.post('/', authenticate, helpRequestValidation, async (req, res) => {
  try {
    const { title, details, courseId } = req.body;

    const request = await prisma.helpRequest.create({
      data: {
        title,
        details,
        courseId: parseInt(courseId),
        authorId: req.user.id
      },
      include: {
        author: { select: { fullName: true } },
        course: { select: { courseCode: true, courseName: true } }
      }
    });

    res.status(201).json({
      message: 'בקשת עזרה נוצרה בהצלחה',
      request
    });
  } catch (error) {
    console.error('Create help request error:', error);
    res.status(500).json({ error: 'שגיאה ביצירת בקשת עזרה' });
  }
});

// PATCH /api/help-requests/:id/status - Update status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'סטטוס לא תקין' });
    }

    const request = await prisma.helpRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({ error: 'בקשה לא נמצאה' });
    }

    // Only author can update status
    if (request.authorId !== req.user.id) {
      return res.status(403).json({ error: 'אין לך הרשאה לעדכן בקשה זו' });
    }

    const updatedRequest = await prisma.helpRequest.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      message: 'סטטוס עודכן בהצלחה',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update help request error:', error);
    res.status(500).json({ error: 'שגיאה בעדכון בקשה' });
  }
});

// DELETE /api/help-requests/:id - Delete help request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.helpRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({ error: 'בקשה לא נמצאה' });
    }

    if (request.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'אין לך הרשאה למחוק בקשה זו' });
    }

    await prisma.helpRequest.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'בקשה נמחקה בהצלחה' });
  } catch (error) {
    console.error('Delete help request error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת בקשה' });
  }
});

module.exports = router;