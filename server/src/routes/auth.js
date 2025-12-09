const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, profileUpdateValidation } = require('../middleware/validation');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const azureStorage = require('../utils/azureStorage');

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for avatar uploads
const storage = multer.memoryStorage();
const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי תמונה (JPG, PNG, WEBP) מותרים'));
    }
  }
});

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
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        institution: user.institution,
        fieldOfStudy: user.fieldOfStudy,
        website: user.website,
        interests: user.interests,
        createdAt: user.createdAt
      }
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
        avatar: true,
        bio: true,
        location: true,
        institution: true,
        fieldOfStudy: true,
        website: true,
        interests: true,
        _count: { select: { summaries: true, forumPosts: true, ratings: true } }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת פרטי משתמש' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, profileUpdateValidation, async (req, res) => {
  try {
    const { fullName, bio, location, institution, fieldOfStudy, website, interests } = req.body;

    // Helper to convert empty strings to null for optional fields
    const emptyToNull = (value) => (value === '' ? null : value);

    // Build update data object with only provided fields
    // Convert empty strings to null for optional fields to keep database clean
    const updateData = {};
    // fullName is required in the schema, so we only update it if a non-empty value is provided
    // This prevents accidentally clearing the user's name
    if (fullName !== undefined && fullName !== '') {
      updateData.fullName = fullName.trim();
    }
    if (bio !== undefined) {
      updateData.bio = emptyToNull(bio);
    }
    if (location !== undefined) {
      updateData.location = emptyToNull(location);
    }
    if (institution !== undefined) {
      updateData.institution = emptyToNull(institution);
    }
    if (fieldOfStudy !== undefined) {
      updateData.fieldOfStudy = emptyToNull(fieldOfStudy);
    }
    if (website !== undefined) {
      updateData.website = emptyToNull(website);
    }
    // interests should be validated as an array by the validation middleware
    // This is defensive coding to ensure we always store a valid array
    if (interests !== undefined) {
      updateData.interests = Array.isArray(interests) ? interests : [];
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true, 
        fullName: true, 
        email: true, 
        role: true, 
        createdAt: true,
        avatar: true,
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
    // Provide more specific error message for common Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }
    res.status(500).json({ error: 'שגיאה בעדכון הפרופיל' });
  }
});

// POST /api/auth/profile/avatar - Upload profile avatar
router.post('/profile/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'לא הועלה קובץ תמונה' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    // Map MIME types to safe file extensions
    const mimeToExtension = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };

    // Get safe file extension from validated MIME type
    // This should never fail due to multer fileFilter validation
    const fileExtension = mimeToExtension[req.file.mimetype];
    if (!fileExtension) {
      return res.status(400).json({ error: 'סוג קובץ לא נתמך' });
    }
    
    // Generate unique filename for the avatar
    const timestamp = Date.now();
    const fileName = `avatars/${user.id}_${timestamp}.${fileExtension}`;

    let avatarUrl;

    // Try to upload to Azure, fallback to local if Azure is not configured
    if (azureStorage.isConfigured()) {
      try {
        // Delete old avatar from Azure if it exists and is a valid Azure URL
        if (user.avatar && user.avatar.startsWith('https://') && user.avatar.includes('.blob.core.windows.net/')) {
          try {
            const oldFileName = azureStorage.extractBlobName(user.avatar);
            if (oldFileName && oldFileName.startsWith('avatars/')) {
              await azureStorage.deleteFile(oldFileName);
            }
          } catch (deleteError) {
            console.log('Could not delete old avatar:', deleteError.message);
            // Don't fail if old file can't be deleted
          }
        }

        // Upload new avatar to Azure
        avatarUrl = await azureStorage.uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        console.log('Avatar uploaded to Azure:', avatarUrl);
      } catch (azureError) {
        console.error('Azure upload failed:', azureError);
        return res.status(500).json({ error: 'שגיאה בהעלאת התמונה לענן' });
      }
    } else {
      // Fallback: save locally (for development)
      const localPath = path.join(__dirname, '../../uploads/avatars');
      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
      }
      const localFilePath = path.join(localPath, `${user.id}_${timestamp}.${fileExtension}`);
      fs.writeFileSync(localFilePath, req.file.buffer);
      avatarUrl = `/uploads/avatars/${user.id}_${timestamp}.${fileExtension}`;
      console.log('Avatar saved locally:', avatarUrl);
    }

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        avatar: true,
        bio: true,
        location: true,
        institution: true,
        fieldOfStudy: true,
        website: true,
        interests: true,
        _count: { select: { summaries: true, forumPosts: true, ratings: true } }
      }
    });

    res.json({ 
      message: 'תמונת הפרופיל עודכנה בהצלחה',
      user: updatedUser,
      avatarUrl 
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (error.message === 'רק קבצי תמונה (JPG, PNG, WEBP) מותרים') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'שגיאה בהעלאת תמונת הפרופיל' });
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