const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');

router.get('/', (req, res, next) => {
  try {
    res.json(ctrl.getProfile());
  } catch (e) { next(e); }
});

router.put('/', (req, res, next) => {
  try {
    const profile = ctrl.updateProfile(req.body);
    res.json(profile);
  } catch (e) { next(e); }
});

module.exports = router;
