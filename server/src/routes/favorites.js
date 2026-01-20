const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites - Get user's favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        summary: {
          include: {
            course: { select: { courseName: true } },
            uploadedBy: { select: { fullName: true } }
          }
        },
        tool: {
          include: {
            addedBy: { select: { fullName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת מועדפים' });
  }
});

// POST /api/favorites/summary/:id - Add summary to favorites
router.post('/summary/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        summaryId: parseInt(id)
      }
    });

    res.status(201).json({ message: 'נוסף למועדפים', favorite });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'כבר במועדפים' });
    }
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'שגיאה בהוספה למועדפים' });
  }
});

// POST /api/favorites/tool/:id - Add tool to favorites
router.post('/tool/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        toolId: parseInt(id)
      }
    });

    res.status(201).json({ message: 'נוסף למועדפים', favorite });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'כבר במועדפים' });
    }
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'שגיאה בהוספה למועדפים' });
  }
});

// DELETE /api/favorites/summary/:id - Remove summary from favorites
router.delete('/summary/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        summaryId: parseInt(id)
      }
    });

    res.json({ message: 'הוסר מהמועדפים' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'שגיאה בהסרה מהמועדפים' });
  }
});

// DELETE /api/favorites/tool/:id - Remove tool from favorites
router.delete('/tool/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        toolId: parseInt(id)
      }
    });

    res.json({ message: 'הוסר מהמועדפים' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'שגיאה בהסרה מהמועדפים' });
  }
});

module.exports = router;