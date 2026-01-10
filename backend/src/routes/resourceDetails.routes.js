const express = require('express');
const Resource = require('../models/Resource');
const ResourceCv = require('../models/ResourceCv');
const { requireAuth, requireAdmin } = require('../security/authMiddleware');

const router = express.Router();

// GET /api/resources/:id/details
// Ritorna dettagli base risorsa, profilo competenze ed elenco CV
router.get('/api/resources/:id/details', requireAuth, async (req, res, next) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (Number.isNaN(resourceId)) {
      return res.status(400).json({ message: 'resourceId non valido' });
    }

    const resource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: ResourceCv,
          as: 'cvs',
          order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']]
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({ message: 'Risorsa non trovata' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const response = {
      resource: {
        id: resource.id,
        firstName: resource.firstName,
        lastName: resource.lastName,
        fullName: `${resource.firstName} ${resource.lastName}`.trim(),
        email: resource.email,
        role: resource.role,
        seniority: resource.seniority,
        mainSkills: resource.mainSkills,
        skillTags: resource.skillTags || [],
        languages: resource.languages || [],
        availability: resource.availability,
        isActive: resource.isActive
      },
      skillsProfile: {
        mainSkills: resource.mainSkills,
        skillTags: resource.skillTags || [],
        languages: resource.languages || []
      },
      cvs: (resource.cvs || []).map(cv => ({
        id: cv.id,
        title: cv.title,
        language: cv.language,
        fileName: cv.fileName,
        mimeType: cv.mimeType,
        fileSizeBytes: cv.fileSizeBytes,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        isPrimary: cv.isPrimary,
        fileId: cv.storageFileId,
        downloadUrl: `${baseUrl}/api/resources/${resource.id}/cvs/${cv.id}/download`
      }))
    };

    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

// GET /api/resources/:id/cvs/:cvId/download
// Download del file CV. Solo ruolo Amministratore.
router.get('/api/resources/:id/cvs/:cvId/download', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const cvId = parseInt(req.params.cvId, 10);

    if (Number.isNaN(resourceId) || Number.isNaN(cvId)) {
      return res.status(400).json({ message: 'Parametri non validi' });
    }

    const cv = await ResourceCv.findOne({
      where: {
        id: cvId,
        resourceId
      }
    });

    if (!cv) {
      return res.status(404).json({ message: 'CV non trovato per la risorsa indicata' });
    }

    // Esempio semplice: lo storage fileId rappresenta un path locale.
    // In un contesto reale potrebbe essere integrazione con S3 o un file service interno.
    const path = require('path');
    const fs = require('fs');

    const filePath = path.join(__dirname, '..', 'storage', cv.storageFileId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File CV non disponibile' });
    }

    res.setHeader('Content-Type', cv.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${cv.fileName}"`);

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => next(err));
    return stream.pipe(res);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
