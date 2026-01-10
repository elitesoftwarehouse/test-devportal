const express = require('express');
const router = express.Router();

const resourcesService = require('../services/resourcesService');

// GET /api/resources/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const resource = await resourcesService.getResourceDetail(id);

    if (!resource) {
      return res.status(404).json({ message: 'Risorsa non trovata' });
    }

    return res.json(resource);
  } catch (error) {
    return next(error);
  }
});

// GET /api/resources/:id/cv/:cvId/download - download rapido CV
router.get('/:id/cv/:cvId/download', async (req, res, next) => {
  try {
    const { id, cvId } = req.params;
    const file = await resourcesService.getResourceCvFile(id, cvId);

    if (!file) {
      return res.status(404).json({ message: 'CV non trovato per questa risorsa' });
    }

    // file: { stream, fileName, mimeType }
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);

    return file.stream.pipe(res);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
