const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/subscriptions/post/:id - Subscribe to post
router.post('/post/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        postId: parseInt(id)
      }
    });

    res.status(201).json({ message: 'עוקב אחרי השאלה', subscription });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'כבר עוקב' });
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'שגיאה במעקב' });
  }
});

// DELETE /api/subscriptions/post/:id - Unsubscribe from post
router.delete('/post/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subscription.deleteMany({
      where: {
        userId: req.user.id,
        postId: parseInt(id)
      }
    });

    res.json({ message: 'הפסקת מעקב' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'שגיאה בהפסקת מעקב' });
  }
});

// GET /api/subscriptions - Get user's subscriptions
router.get('/', authenticate, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      include: {
        post: {
          include: {
            course: { select: { courseName: true } },
            author: { select: { fullName: true } },
            _count: { select: { comments: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת מעקבים' });
  }
});

module.exports = router;