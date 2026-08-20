const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/generatedDocumentsController');

router.get('/', async (req, res, next) => {
  try { res.json(await ctrl.getAll()); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await ctrl.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.type || !req.body.content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }
    res.status(201).json(await ctrl.create(req.body));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await ctrl.remove(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (e) { next(e); }
});

module.exports = router;
