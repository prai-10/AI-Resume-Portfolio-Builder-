const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/generatedDocumentsController');

router.get('/', (req, res, next) => {
  try { res.json(ctrl.getAll()); } catch (e) { next(e); }
});

router.get('/:id', (req, res, next) => {
  try {
    const item = ctrl.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', (req, res, next) => {
  try {
    if (!req.body.type || !req.body.content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }
    res.status(201).json(ctrl.create(req.body));
  } catch (e) { next(e); }
});

router.delete('/:id', (req, res, next) => {
  try {
    ctrl.remove(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (e) { next(e); }
});

module.exports = router;
