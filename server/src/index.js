require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const summariesRoutes = require('./routes/summaries');
const forumRoutes = require('./routes/forum');
const toolsRoutes = require('./routes/tools');
const adminRoutes = require('./routes/admin');
const helpRequestsRoutes = require('./routes/helpRequests');
const notificationsRoutes = require('./routes/notifications');
const messagesRoutes = require('./routes/messages');
const reportsRoutes = require('./routes/reports');
const favoritesRoutes = require('./routes/favorites');
const subscriptionsRoutes = require('./routes/subscriptions');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Import Google Drive utilities for startup check
const { isDriveConfigured } = require('./utils/googleDrive');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'StudyHub-IL API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/summaries', summariesRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/help-requests', helpRequestsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server only if not in test mode (supertest handles server in tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: Connected`);
    console.log(`✨ Version: 2.0.0 - Full Features`);
    
    // Check Google Drive configuration
    if (isDriveConfigured()) {
      console.log(`☁️  Google Drive: Configured (files will be uploaded to Drive)`);
    } else {
      console.log(`💾 Google Drive: Not configured (files will be stored locally)`);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;