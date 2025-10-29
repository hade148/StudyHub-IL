const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

const messageValidation = [
  body('receiverId').isInt({ min: 1 }).withMessage('נמען לא תקין'),
  body('content').trim().notEmpty().withMessage('תוכן ההודעה הוא שדה חובה'),
  validate
];

// GET /api/messages - Get user's conversations
router.get('/', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePicture: true } },
        receiver: { select: { id: true, fullName: true, profilePicture: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner: msg.senderId === req.user.id ? msg.receiver : msg.sender,
          messages: [],
          unreadCount: 0
        };
      }
      conversations[partnerId].messages.push(msg);
      if (msg.receiverId === req.user.id && !msg.isRead) {
        conversations[partnerId].unreadCount++;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הודעות' });
  }
});

// GET /api/messages/:userId - Get conversation with specific user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const partnerId = parseInt(userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: req.user.id }
        ]
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePicture: true } },
        receiver: { select: { id: true, fullName: true, profilePicture: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת שיחה' });
  }
});

// POST /api/messages - Send message
router.post('/', authenticate, messageValidation, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        receiverId: parseInt(receiverId)
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePicture: true } },
        receiver: { select: { id: true, fullName: true, profilePicture: true } }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        type: 'MESSAGE',
        title: 'הודעה חדשה',
        message: `${req.user.fullName} שלח לך הודעה`,
        isRead: false
      }
    });

    res.status(201).json({ message: 'הודעה נשלחה', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'שגיאה בשליחת הודעה' });
  }
});

// GET /api/messages/unread/count - Get unread count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'שגיאה בספירת הודעות' });
  }
});

module.exports = router;