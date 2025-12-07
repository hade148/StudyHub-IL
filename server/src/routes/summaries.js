const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { summaryValidation, ratingValidation, commentValidation } = require('../middleware/validation');
const { uploadFileToDrive, deleteFileFromDrive, isDriveConfigured } = require('../utils/googleDrive');

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for temporary file storage before uploading to Drive.
// Files are stored in uploads/temp temporarily and then:
// - Moved to uploads/ if Google Drive is not configured
// - Deleted after successful upload to Google Drive
// - Deleted on upload error
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'summary-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי PDF ו-DOCX מותרים'));
    }
  }
});

// GET /api/summaries - Get all summaries with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { courseId, search, sortBy = 'recent' } = req.query;

    const where = {};
    if (courseId) where.courseId = parseInt(courseId);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy = { uploadDate: 'desc' };
    if (sortBy === 'rating') orderBy = { avgRating: 'desc' };
    if (sortBy === 'title') orderBy = { title: 'asc' };

    const summaries = await prisma.summary.findMany({
      where,
      orderBy,
      include: {
        course: { select: { courseCode: true, courseName: true } },
        uploadedBy: { select: { id: true, fullName: true } },
        _count: { select: { ratings: true, comments: true } }
      }
    });

    res.json(summaries);
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סיכומים' });
  }
});

// GET /api/summaries/:id - Get single summary
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true,
        uploadedBy: { select: { id: true, fullName: true, email: true } },
        ratings: { include: { user: { select: { fullName: true } } } },
        comments: {
          include: { author: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת סיכום' });
  }
});

// GET /api/summaries/:id/download - Download summary file
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: parseInt(id) }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    // If file is on Google Drive, redirect to the Drive link
    if (summary.filePath.startsWith('http://') || summary.filePath.startsWith('https://')) {
      return res.redirect(summary.filePath);
    }

    // For local files, serve the file
    const filePath = path.join(__dirname, '../../', summary.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'קובץ לא נמצא' });
    }

    // Set appropriate headers
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.docx' 
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';
    
    // Sanitize filename to prevent header injection attacks
    // Remove only characters that are invalid in filenames across platforms
    // Keep Hebrew and other Unicode characters
    const sanitizedTitle = summary.title.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
    // Ensure the filename doesn't start with special characters or contain '..'
    const safeTitle = sanitizedTitle.replace(/^[._-]+/, '').replace(/\.\./g, '_');
    const filename = `${safeTitle}${ext}`;
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'שגיאה בהורדת קובץ' });
  }
});

// POST /api/summaries - Upload new summary
router.post('/', authenticate, upload.single('file'), summaryValidation, async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { title, description, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'יש להעלות קובץ PDF או DOCX' });
    }

    tempFilePath = req.file.path;
    let driveFileId = null;
    let driveViewLink = null;
    let filePath = `uploads/${req.file.filename}`;

    // Upload to Google Drive if configured
    if (isDriveConfigured()) {
      try {
        // Determine file extension and mime type
        const fileExt = path.extname(req.file.originalname);
        const mimeType = req.file.mimetype;
        
        const driveResult = await uploadFileToDrive({
          filePath: tempFilePath,
          fileName: `${title}_${Date.now()}${fileExt}`,
          mimeType: mimeType
        });
        
        driveFileId = driveResult.fileId;
        driveViewLink = driveResult.webViewLink;
        // When using Google Drive, filePath stores the web view URL for accessing the file
        filePath = driveResult.webViewLink;

        // Delete temp file after successful upload to Drive
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        tempFilePath = null;
      } catch (driveError) {
        // Log the full error for debugging, including original error details
        console.error('Google Drive upload failed:', {
          message: driveError.message,
          stack: driveError.stack
        });
        // Keep local file if Drive upload fails
        const permanentDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(permanentDir)) {
          fs.mkdirSync(permanentDir, { recursive: true });
        }
        const permanentPath = path.join(permanentDir, req.file.filename);
        fs.renameSync(tempFilePath, permanentPath);
        tempFilePath = null;
        filePath = `uploads/${req.file.filename}`;
      }
    } else {
      // No Drive configured, move to permanent storage
      const permanentDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(permanentDir)) {
        fs.mkdirSync(permanentDir, { recursive: true });
      }
      const permanentPath = path.join(permanentDir, req.file.filename);
      fs.renameSync(tempFilePath, permanentPath);
      tempFilePath = null;
    }

    const summary = await prisma.summary.create({
      data: {
        title,
        description,
        filePath,
        driveFileId,
        driveViewLink,
        courseId: parseInt(courseId),
        uploadedById: req.user.id
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        uploadedBy: { select: { fullName: true } }
      }
    });

    res.status(201).json({
      message: 'סיכום הועלה בהצלחה',
      summary
    });
  } catch (error) {
    console.error('Upload summary error:', error);
    // Delete temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    res.status(500).json({ error: 'שגיאה בהעלאת סיכום' });
  }
});

// DELETE /api/summaries/:id - Delete summary
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: parseInt(id) }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    // Check ownership or admin
    if (summary.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'אין לך הרשאה למחוק סיכום זה' });
    }

    // Delete file from Google Drive if it exists there
    if (summary.driveFileId) {
      await deleteFileFromDrive(summary.driveFileId);
    }

    // Delete local file if it exists
    if (summary.filePath && !summary.filePath.startsWith('http')) {
      const filePath = path.join(__dirname, '../../', summary.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.summary.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'סיכום נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'שגיאה במחיקת סיכום' });
  }
});

// POST /api/summaries/:id/rate - Rate a summary
router.post('/:id/rate', authenticate, ratingValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Upsert rating
    const newRating = await prisma.rating.upsert({
      where: {
        summaryId_userId: {
          summaryId: parseInt(id),
          userId: req.user.id
        }
      },
      update: { rating },
      create: {
        rating,
        summaryId: parseInt(id),
        userId: req.user.id
      }
    });

    // Update average rating
    const ratings = await prisma.rating.findMany({
      where: { summaryId: parseInt(id) }
    });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await prisma.summary.update({
      where: { id: parseInt(id) },
      data: { avgRating }
    });

    res.json({
      message: 'דירוג נשמר בהצלחה',
      rating: newRating,
      avgRating
    });
  } catch (error) {
    console.error('Rate summary error:', error);
    res.status(500).json({ error: 'שגיאה בדירוג סיכום' });
  }
});

// POST /api/summaries/:id/comments - Add comment to summary
router.post('/:id/comments', authenticate, commentValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await prisma.comment.create({
      data: {
        text,
        summaryId: parseInt(id),
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, fullName: true } }
      }
    });

    res.status(201).json({
      message: 'תגובה נוספה בהצלחה',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'שגיאה בהוספת תגובה' });
  }
});

module.exports = router;