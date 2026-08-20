const express = require('express');
const router = express.Router();
const { generateResume, generateCoverLetter, isDemoMode } = require('../services/aiService');
const profileCtrl = require('../controllers/profileController');
const educationCtrl = require('../controllers/educationController');
const skillsCtrl = require('../controllers/skillsController');
const projectsCtrl = require('../controllers/projectsController');
const experienceCtrl = require('../controllers/experienceController');
const certificationsCtrl = require('../controllers/certificationsController');
const achievementsCtrl = require('../controllers/achievementsController');
const linksCtrl = require('../controllers/linksController');
const docsCtrl = require('../controllers/generatedDocumentsController');

// Helper: load all profile data from DB
function loadFullProfile() {
  return {
    profile: profileCtrl.getProfile(),
    education: educationCtrl.getAll(),
    skills: skillsCtrl.getAll(),
    projects: projectsCtrl.getAll(),
    experience: experienceCtrl.getAll(),
    certifications: certificationsCtrl.getAll(),
    achievements: achievementsCtrl.getAll(),
    links: linksCtrl.getAll()
  };
}

// GET /api/ai/status
router.get('/status', (req, res) => {
  res.json({
    mode: isDemoMode ? 'demo' : 'live',
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    message: isDemoMode
      ? 'Demo Mode active — set AI_API_KEY in server/.env to enable live AI'
      : 'Live AI mode active'
  });
});

// POST /api/ai/generate-resume
router.post('/generate-resume', async (req, res, next) => {
  try {
    const { targetRole, targetIndustry, jobDescription, template } = req.body;
    if (!targetRole) return res.status(400).json({ error: 'Target role is required' });

    const profileData = loadFullProfile();
    const content = await generateResume(profileData, targetRole, targetIndustry, jobDescription);

    // Save to DB
    const doc = docsCtrl.create({
      type: 'resume',
      title: `Resume — ${targetRole}`,
      target_role: targetRole,
      target_company: null,
      job_description: jobDescription || null,
      template: template || 'modern',
      content,
      metadata: {
        targetIndustry,
        mode: isDemoMode ? 'demo' : 'live',
        generatedAt: new Date().toISOString()
      }
    });

    res.json({ document: doc, mode: isDemoMode ? 'demo' : 'live' });
  } catch (e) {
    next(e);
  }
});

// POST /api/ai/generate-cover-letter
router.post('/generate-cover-letter', async (req, res, next) => {
  try {
    const { targetCompany, jobTitle, jobDescription } = req.body;
    if (!targetCompany || !jobTitle) {
      return res.status(400).json({ error: 'Target company and job title are required' });
    }

    const profileData = loadFullProfile();
    const content = await generateCoverLetter(profileData, targetCompany, jobTitle, jobDescription);

    const doc = docsCtrl.create({
      type: 'cover_letter',
      title: `Cover Letter — ${jobTitle} at ${targetCompany}`,
      target_role: jobTitle,
      target_company: targetCompany,
      job_description: jobDescription || null,
      template: 'standard',
      content,
      metadata: {
        mode: isDemoMode ? 'demo' : 'live',
        generatedAt: new Date().toISOString()
      }
    });

    res.json({ document: doc, mode: isDemoMode ? 'demo' : 'live' });
  } catch (e) {
    next(e);
  }
});

// GET /api/ai/portfolio-data
router.get('/portfolio-data', (req, res, next) => {
  try {
    res.json(loadFullProfile());
  } catch (e) {
    next(e);
  }
});

module.exports = router;
