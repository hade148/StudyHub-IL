const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, profileUpdateValidation } = require('../middleware/validation');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

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

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, fullName).catch(err => {
      console.error('Failed to send welcome email:', err);
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
        id: true, 
        fullName: true, 
        email: true, 
        role: true, 
        createdAt: true,
        bio: true,
        location: true,
        institution: true,
        fieldOfStudy: true,
        website: true,
        interests: true,
        _count: { select: { summaries: true, forumPosts: true, ratings: true } }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת פרטי משתמש' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, profileUpdateValidation, async (req, res) => {
  try {
    const { fullName, bio, location, institution, fieldOfStudy, website, interests } = req.body;

    // Build update data object with only provided fields
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (institution !== undefined) updateData.institution = institution;
    if (fieldOfStudy !== undefined) updateData.fieldOfStudy = fieldOfStudy;
    if (website !== undefined) updateData.website = website;
    if (interests !== undefined) updateData.interests = interests;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true, 
        fullName: true, 
        email: true, 
        role: true, 
        createdAt: true,
        bio: true,
        location: true,
        institution: true,
        fieldOfStudy: true,
        website: true,
        interests: true,
        _count: { select: { summaries: true, forumPosts: true, ratings: true } }
      }
    });

    res.json({ message: 'הפרופיל עודכן בהצלחה', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'שגיאה בעדכון הפרופיל' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiresAt }
    });

    // Send password reset email
    await sendPasswordResetEmail(email, user.fullName, resetToken);

    res.json({ message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'שגיאה בשליחת מייל לאיפוס סיסמה' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'קישור איפוס לא תקין או שפג תוקפו' });
    }

    // Hash new password and clear reset token
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    res.json({ message: 'הסיסמה אופסה בהצלחה' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'שגיאה באיפוס סיסמה' });
  }
});

module.exports = router;