const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            summaries: true,
            forumPosts: true,
            ratings: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת משתמשים' });
  }
});

// GET /api/admin/stats - Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalSummaries,
      totalForumPosts,
      totalTools
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.summary.count(),
      prisma.forumPost.count(),
      prisma.tool.count()
    ]);

    const recentActivity = await prisma.summary.findMany({
      take: 5,
      orderBy: { uploadDate: 'desc' },
      include: {
        uploadedBy: { select: { fullName: true } },
        course: { select: { courseName: true } }
      }
    });

    res.json({
      totalUsers,
      totalCourses,
      totalSummaries,
      totalForumPosts,
      totalTools,
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סטטיסטיקות' });
  }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'תפקיד לא תקין' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });

    res.json({
      message: 'תפקיד משתמש עודכן בהצלחה',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'שגיאה בעדכון תפקיד' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'לא ניתן למחוק את עצמך' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'משתמש נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת משתמש' });
  }
});

module.exports = router;