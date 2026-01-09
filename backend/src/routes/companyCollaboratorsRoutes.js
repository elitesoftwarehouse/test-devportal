const express = require('express');
const companyCollaboratorService = require('../services/companyCollaboratorService');

const router = express.Router();

// Middleware di autenticazione/contesto utente: si assume che req.user.id sia valorizzato
// seguendo i pattern delle altre route del progetto.

router.get('/companies/:companyId/collaborators', async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const collaborators = await companyCollaboratorService.listByCompany(companyId);
    res.json(collaborators);
  } catch (err) {
    next(err);
  }
});

router.get('/companies/collaborators/metadata', (req, res) => {
  res.json({
    roles: companyCollaboratorService.getAllowedRoles(),
    status: companyCollaboratorService.getAllowedStatus(),
  });
});

router.post('/companies/:companyId/collaborators', async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { userId, role, status } = req.body;
    const userAuditId = req.user && req.user.id ? req.user.id : null;

    const association = await companyCollaboratorService.addCollaboratorToCompany({
      companyId,
      userId,
      role,
      status,
      userAuditId,
    });

    res.status(201).json(association);
  } catch (err) {
    next(err);
  }
});

router.put('/companies/collaborators/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    const userAuditId = req.user && req.user.id ? req.user.id : null;

    const association = await companyCollaboratorService.updateCollaboratorAssociation(id, {
      role,
      status,
      userAuditId,
    });

    res.json(association);
  } catch (err) {
    next(err);
  }
});

router.delete('/companies/collaborators/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await companyCollaboratorService.removeCollaboratorAssociation(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
