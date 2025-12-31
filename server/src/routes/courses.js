const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth');
const { courseValidation } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/courses/institutions - Get list of unique institutions
router.get('/institutions', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: { institution: true },
      distinct: ['institution'],
      orderBy: { institution: 'asc' }
    });
    
    const institutions = courses.map(c => c.institution).filter(Boolean);
    res.json(institutions);
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת מוסדות לימודים' });
  }
});

// GET /api/courses - Get all courses with optional search and institution filter
router.get('/', async (req, res) => {
  try {
    const { search, institution } = req.query;

    const where = {};
    const andConditions = [];
    
    // Filter by institution
    if (institution) {
      andConditions.push({ institution });
    }
    
    if (search) {
      andConditions.push({
        OR: [
          { courseName: { contains: search, mode: 'insensitive' } },
          { courseCode: { contains: search, mode: 'insensitive' } },
          { institution: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: { summaries: true, forumPosts: true }
        }
      },
      orderBy: [
        { institution: 'asc' },
        { courseName: 'asc' }
      ]
    });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת קורסים' });
  }
});

// GET /api/courses/:id - Get single course
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        summaries: {
          take: 10,
          orderBy: { uploadDate: 'desc' },
          include: {
            uploadedBy: {
              select: { id: true, fullName: true }
            }
          }
        },
        forumPosts: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { summaries: true, forumPosts: true, helpRequests: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'קורס לא נמצא' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת קורס' });
  }
});

// POST /api/courses - Create new course (admin only)
router.post('/', authenticate, isAdmin, courseValidation, async (req, res) => {
  try {
    const { courseCode, courseName, institution, semester } = req.body;

    const existingCourse = await prisma.course.findUnique({
      where: { courseCode }
    });

    if (existingCourse) {
      return res.status(400).json({ error: 'קורס עם קוד זה כבר קיים' });
    }

    const course = await prisma.course.create({
      data: { courseCode, courseName, institution, semester }
    });

    res.status(201).json({
      message: 'קורס נוצר בהצלחה',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'שגיאה ביצירת קורס' });
  }
});

// DELETE /api/courses/:id - Delete course (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'קורס נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת קורס' });
  }
});

module.exports = router;