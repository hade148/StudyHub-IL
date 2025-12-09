const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { summaryValidation, ratingValidation, commentValidation } = require('../middleware/validation');
const azureStorage = require('../utils/azureStorage');

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage for Azure

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי PDF ו-DOCX מותרים'));
    }
  }
});

// GET /api/summaries - Get all summaries with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { courseId, search, sortBy = 'recent', institution } = req.query;

    const where = {};
    const andConditions = [];
    
    if (courseId) {
      andConditions.push({ courseId: parseInt(courseId) });
    }
    
    // Filter by institution
    if (institution) {
      andConditions.push({ course: { institution } });
    }
    
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { course: { courseName: { contains: search, mode: 'insensitive' } } },
          { course: { courseCode: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy = { uploadDate: 'desc' };
    if (sortBy === 'rating') orderBy = { avgRating: 'desc' };
    if (sortBy === 'title') orderBy = { title: 'asc' };

    const summaries = await prisma.summary.findMany({
      where,
      orderBy,
      include: {
        course: { select: { courseCode: true, courseName: true, institution: true } },
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

// POST /api/summaries - Upload new summary
router.post('/', authenticate, upload.single('file'), summaryValidation, async (req, res) => {
  try {
    const { title, description, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'יש להעלות קובץ PDF או DOCX' });
    }

    let filePath;
    let fileUrl;

    // Try to upload to Azure Blob Storage
    if (azureStorage.isConfigured()) {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = 'summary-' + uniqueSuffix + path.extname(req.file.originalname);
        
        fileUrl = await azureStorage.uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        
        filePath = fileName; // Store just the filename in DB
        console.log(`✅ File uploaded to Azure: ${fileName}`);
      } catch (azureError) {
        console.error('Azure upload failed:', azureError);
        return res.status(500).json({ error: 'שגיאה בהעלאת קובץ לענן' });
      }
    } else {
      // Fallback to local storage if Azure is not configured
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = 'summary-' + uniqueSuffix + path.extname(req.file.originalname);
      const localPath = path.join(uploadDir, fileName);
      
      await fs.promises.writeFile(localPath, req.file.buffer);
      filePath = `uploads/${fileName}`;
      console.log(`⚠️ Azure not configured, saved locally: ${filePath}`);
    }

    const summary = await prisma.summary.create({
      data: {
        title,
        description,
        filePath,
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
      summary: {
        ...summary,
        fileUrl: azureStorage.isConfigured() ? fileUrl : undefined
      }
    });
  } catch (error) {
    console.error('Upload summary error:', error);
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

    // Delete file from storage
    if (azureStorage.isConfigured()) {
      try {
        const blobName = azureStorage.extractBlobName(summary.filePath);
        await azureStorage.deleteFile(blobName);
        console.log(`✅ File deleted from Azure: ${blobName}`);
      } catch (azureError) {
        console.error('Azure delete failed:', azureError);
        // Continue with DB deletion even if Azure delete fails
      }
    } else {
      // Delete from local storage
      const filePath = path.join(__dirname, '../../', summary.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ File deleted locally: ${filePath}`);
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

// GET /api/summaries/:id/download - Get download URL for summary file
router.get('/:id/download', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: parseInt(id) },
      select: { filePath: true, title: true }
    });

    if (!summary) {
      return res.status(404).json({ error: 'סיכום לא נמצא' });
    }

    if (azureStorage.isConfigured()) {
      // Return Azure blob URL
      const fileUrl = azureStorage.getFileUrl(summary.filePath);
      res.json({ 
        downloadUrl: fileUrl,
        fileName: summary.title
      });
    } else {
      // For local storage, serve the file directly
      const filePath = path.join(__dirname, '../../', summary.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'קובץ לא נמצא' });
      }
      res.download(filePath);
    }
  } catch (error) {
    console.error('Download summary error:', error);
    res.status(500).json({ error: 'שגיאה בהורדת סיכום' });
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