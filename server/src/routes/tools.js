const express = require('express');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { toolValidation, toolRatingValidation } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to calculate average rating
const calculateAverageRating = (ratings) => {
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
};

// Rate limiter for tool creation - 10 tools per hour per user
const createToolLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'יותר מדי ניסיונות להוספת כלי. נסה שוב בעוד שעה.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || req.ip
});

// Rate limiter for tool deletion - 20 deletions per hour per user
const deleteToolLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'יותר מדי ניסיונות למחיקת כלי. נסה שוב בעוד שעה.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || req.ip
});

// Rate limiter for tool rating - 100 ratings per hour per user
const rateToolLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'יותר מדי ניסיונות לדירוג. נסה שוב בעוד שעה.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || req.ip
});

// GET /api/tools - Get all tools
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const tools = await prisma.tool.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        addedBy: { select: { id: true, fullName: true } },
        favorites: req.user ? {
          where: { userId: req.user.id }
        } : false,
        _count: { select: { ratings: true } }
      }
    });

    // Add isFavorite flag for each tool
    const toolsWithFavorite = tools.map(tool => ({
      ...tool,
      isFavorite: req.user ? tool.favorites.length > 0 : false,
      favorites: undefined, // Remove favorites array from response
      ratingCount: tool._count.ratings
    }));

    res.json(toolsWithFavorite);
  } catch (error) {
    console.error('Get tools error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת כלים' });
  }
});

// GET /api/tools/:id - Get single tool
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await prisma.tool.findUnique({
      where: { id: parseInt(id) },
      include: {
        addedBy: { select: { id: true, fullName: true, email: true } },
        favorites: req.user ? {
          where: { userId: req.user.id }
        } : false,
        ratings: { include: { user: { select: { fullName: true } } } },
        _count: { select: { ratings: true } }
      }
    });

    if (!tool) {
      return res.status(404).json({ error: 'כלי לא נמצא' });
    }

    const toolWithFavorite = {
      ...tool,
      isFavorite: req.user ? tool.favorites.length > 0 : false,
      favorites: undefined,
      ratingCount: tool._count.ratings
    };

    res.json(toolWithFavorite);
  } catch (error) {
    console.error('Get tool error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת כלי' });
  }
});

// POST /api/tools - Add new tool
router.post('/', authenticate, createToolLimiter, toolValidation, async (req, res) => {
  try {
    const { title, url, description, category } = req.body;

    const tool = await prisma.tool.create({
      data: {
        title,
        url,
        description,
        category,
        addedById: req.user.id
      },
      include: {
        addedBy: { select: { fullName: true } }
      }
    });

    res.status(201).json({
      message: 'כלי נוסף בהצלחה',
      tool
    });
  } catch (error) {
    console.error('Add tool error:', error);
    res.status(500).json({ error: 'שגיאה בהוספת כלי' });
  }
});

// DELETE /api/tools/:id - Delete tool
router.delete('/:id', authenticate, deleteToolLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await prisma.tool.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tool) {
      return res.status(404).json({ error: 'כלי לא נמצא' });
    }

    // Check ownership or admin
    if (tool.addedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'אין לך הרשאה למחוק כלי זה' });
    }

    await prisma.tool.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'כלי נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete tool error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת כלי' });
  }
});

// POST /api/tools/:id/rate - Rate a tool
router.post('/:id/rate', authenticate, rateToolLimiter, toolRatingValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Upsert rating
    const newRating = await prisma.toolRating.upsert({
      where: {
        toolId_userId: {
          toolId: parseInt(id),
          userId: req.user.id
        }
      },
      update: { rating },
      create: {
        rating,
        toolId: parseInt(id),
        userId: req.user.id
      }
    });

    // Update average rating
    const ratings = await prisma.toolRating.findMany({
      where: { toolId: parseInt(id) }
    });
    const avgRating = calculateAverageRating(ratings);

    await prisma.tool.update({
      where: { id: parseInt(id) },
      data: { avgRating }
    });

    res.json({
      message: 'דירוג נשמר בהצלחה',
      rating: newRating,
      avgRating
    });
  } catch (error) {
    console.error('Rate tool error:', error);
    res.status(500).json({ error: 'שגיאה בדירוג כלי' });
  }
});

// GET /api/tools/:id/ratings - Get ratings for a tool
router.get('/:id/ratings', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await prisma.toolRating.findMany({
      where: { toolId: parseInt(id) },
      include: {
        user: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const avgRating = calculateAverageRating(ratings);

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
    console.error('Get tool ratings error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת דירוגים' });
  }
});

module.exports = router;