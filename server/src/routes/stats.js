const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/stats - Get platform statistics
router.get('/', async (req, res) => {
  try {
    // Get counts from database
    const [summariesCount, forumPostsCount, toolsCount, usersCount] = await Promise.all([
      prisma.summary.count(),
      prisma.forumPost.count(),
      prisma.tool.count(),
      prisma.user.count()
    ]);

    res.json({
      summaries: summariesCount,
      forumPosts: forumPostsCount,
      tools: toolsCount,
      users: usersCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סטטיסטיקות' });
  }
});

module.exports = router;
