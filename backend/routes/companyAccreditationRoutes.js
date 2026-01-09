const express = require('express');
const router = express.Router();

const {
  findCompanyById,
  updateCompanyAccreditationData,
} = require('../repositories/companyRepository');

// Middleware placeholder per autenticazione/ruoli
function requireAuth(req, res, next) {
  // Integrazione con auth esistente: qui assumiamo che req.user sia valorizzato
  // e che abbia ruoli già verificati altrove se necessario.
  if (!req.user) {
    return res.status(401).json({ message: 'Non autenticato' });
  }
  return next();
}

// GET /api/companies/:id/accreditation
router.get('/api/companies/:id/accreditation', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID azienda non valido' });
    }

    const company = await findCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: 'Azienda non trovata' });
    }

    return res.json({
      id: company.id,
      name: company.name,
      legalName: company.legalName,
      vatNumber: company.vatNumber,
      taxCode: company.taxCode,
      legalAddressStreet: company.legalAddressStreet,
      legalAddressPostalCode: company.legalAddressPostalCode,
      legalAddressCity: company.legalAddressCity,
      legalAddressProvince: company.legalAddressProvince,
      legalAddressCountry: company.legalAddressCountry,
      businessEmail: company.businessEmail,
      businessPhone: company.businessPhone,
      accreditationStatus: company.accreditationStatus,
      firstAccreditationAt: company.firstAccreditationAt,
      lastAccreditationUpdateAt: company.lastAccreditationUpdateAt,
      owner: company.owner
        ? {
            id: company.owner.id,
            email: company.owner.email,
            firstName: company.owner.firstName,
            lastName: company.owner.lastName,
          }
        : null,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore GET accreditamento azienda', error);
    return res.status(500).json({ message: 'Errore interno' });
  }
});

// PUT /api/companies/:id/accreditation
router.put('/api/companies/:id/accreditation', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID azienda non valido' });
    }

    const allowedStatuses = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'];
    const payload = { ...req.body };

    if (payload.accreditationStatus && !allowedStatuses.includes(payload.accreditationStatus)) {
      return res.status(400).json({ message: 'stato_accreditamento non valido' });
    }

    const company = await updateCompanyAccreditationData(id, payload);
    if (!company) {
      return res.status(404).json({ message: 'Azienda non trovata' });
    }

    return res.json({
      id: company.id,
      name: company.name,
      legalName: company.legalName,
      vatNumber: company.vatNumber,
      taxCode: company.taxCode,
      legalAddressStreet: company.legalAddressStreet,
      legalAddressPostalCode: company.legalAddressPostalCode,
      legalAddressCity: company.legalAddressCity,
      legalAddressProvince: company.legalAddressProvince,
      legalAddressCountry: company.legalAddressCountry,
      businessEmail: company.businessEmail,
      businessPhone: company.businessPhone,
      accreditationStatus: company.accreditationStatus,
      firstAccreditationAt: company.firstAccreditationAt,
      lastAccreditationUpdateAt: company.lastAccreditationUpdateAt,
      owner: company.owner
        ? {
            id: company.owner.id,
            email: company.owner.email,
            firstName: company.owner.firstName,
            lastName: company.owner.lastName,
          }
        : null,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore PUT accreditamento azienda', error);
    return res.status(500).json({ message: 'Errore interno' });
  }
});

module.exports = router;
