const express = require('express');
const router = express.Router();
const { generateResume, generateCoverLetter } = require('../services/aiService');
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
async function loadFullProfile() {
  const [profile, education, skills, projects, experience, certifications, achievements, links] = await Promise.all([
    profileCtrl.getProfile(),
    educationCtrl.getAll(),
    skillsCtrl.getAll(),
    projectsCtrl.getAll(),
    experienceCtrl.getAll(),
    certificationsCtrl.getAll(),
    achievementsCtrl.getAll(),
    linksCtrl.getAll()
  ]);
  return {
    profile,
    education,
    skills,
    projects,
    experience,
    certifications,
    achievements,
    links
  };
}

// GET /api/ai/status
router.get('/status', (req, res) => {
  const hasApiKey = !!process.env.AI_API_KEY;
  res.json({
    mode: hasApiKey ? 'live' : 'disabled',
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    message: hasApiKey
      ? 'Live AI mode active'
      : 'AI API Key is missing. Please configure AI_API_KEY in Vercel to enable AI features.'
  });
});

// POST /api/ai/generate-resume
router.post('/generate-resume', async (req, res, next) => {
  try {
    const { targetRole, targetIndustry, jobDescription, template } = req.body;
    if (!targetRole) return res.status(400).json({ error: 'Target role is required' });

    if (!process.env.AI_API_KEY) {
      return res.status(400).json({ error: 'AI features are disabled. Please configure AI_API_KEY on Vercel.' });
    }

    const profileData = await loadFullProfile();
    const content = await generateResume(profileData, targetRole, targetIndustry, jobDescription);

    // Save to DB
    const doc = await docsCtrl.create({
      type: 'resume',
      title: `Resume — ${targetRole}`,
      target_role: targetRole,
      target_company: null,
      job_description: jobDescription || null,
      template: template || 'modern',
      content,
      metadata: {
        targetIndustry,
        mode: 'live',
        generatedAt: new Date().toISOString()
      }
    });

    res.json({ document: doc, mode: 'live' });
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

    if (!process.env.AI_API_KEY) {
      return res.status(400).json({ error: 'AI features are disabled. Please configure AI_API_KEY on Vercel.' });
    }

    const profileData = await loadFullProfile();
    const content = await generateCoverLetter(profileData, targetCompany, jobTitle, jobDescription);

    const doc = await docsCtrl.create({
      type: 'cover_letter',
      title: `Cover Letter — ${jobTitle} at ${targetCompany}`,
      target_role: jobTitle,
      target_company: targetCompany,
      job_description: jobDescription || null,
      template: 'standard',
      content,
      metadata: {
        mode: 'live',
        generatedAt: new Date().toISOString()
      }
    });

    res.json({ document: doc, mode: 'live' });
  } catch (e) {
    next(e);
  }
});

// GET /api/ai/portfolio-data
router.get('/portfolio-data', async (req, res, next) => {
  try {
    res.json(await loadFullProfile());
  } catch (e) {
    next(e);
  }
});

module.exports = router;
