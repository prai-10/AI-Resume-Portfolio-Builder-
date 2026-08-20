require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initializeDatabase } = require('./database/init');

// Import routes
const profileRoutes = require('./routes/profile');
const educationRoutes = require('./routes/education');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const experienceRoutes = require('./routes/experience');
const certificationsRoutes = require('./routes/certifications');
const achievementsRoutes = require('./routes/achievements');
const linksRoutes = require('./routes/links');
const generatedDocumentsRoutes = require('./routes/generatedDocuments');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Build the CORS allowed-origin list from the environment.
// CLIENT_URL can be a single URL or a comma-separated list for multi-origin deploys.
const rawClientUrls = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrls.split(',').map(u => u.trim()).filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin in production)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/certifications', certificationsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/generated-documents', generatedDocumentsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Resume Builder API is running', timestamp: new Date().toISOString() });
});

// Environment debug (safe - does not expose keys)
app.get('/api/debug-env', (req, res) => {
  res.json({
    hasApiKey: !!process.env.AI_API_KEY,
    apiKeyLength: process.env.AI_API_KEY ? process.env.AI_API_KEY.length : 0,
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    env: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Export app for serverless deployment
module.exports = app;

// Initialize database then start server (only if not running on Vercel)
if (!process.env.VERCEL) {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 AI Resume Builder Server running on http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Mode: ${process.env.AI_API_KEY ? 'Live AI' : 'Demo Mode'}\n`);
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}
