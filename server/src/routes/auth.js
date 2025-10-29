const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'משתמש עם אימייל זה כבר קיים' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: 'USER' },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true }
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ message: 'משתמש נוצר בהצלחה', token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'שגיאה ביצירת משתמש' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      message: 'התחברת בהצלחה',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'שגיאה בהתחברות' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, fullName: true, email: true, role: true, createdAt: true,
        _count: { select: { summaries: true, forumPosts: true, ratings: true } }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת פרטי משתמש' });
  }
});

module.exports = router;