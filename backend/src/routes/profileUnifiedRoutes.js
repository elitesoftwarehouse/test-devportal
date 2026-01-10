const express = require('express');
const router = express.Router();

// Middleware di autenticazione/contesto utente
// Si assume che un middleware globale imposti req.user con almeno { id, role }

/**
 * GET /api/profiles/unified
 * Query params supportati:
 *  - type: 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE' | 'ALL'
 *  - qualityMin: number (0-100)
 *  - orderBy: 'name' | 'type' | 'quality' | 'status'
 *  - orderDir: 'asc' | 'desc'
 */
router.get('/unified', async (req, res) => {
  try {
    const {
      type = 'ALL',
      qualityMin,
      orderBy = 'name',
      orderDir = 'asc'
    } = req.query;

    // In questo stub non accediamo al DB, ma replichiamo il formato
    // previsto dal task backend precedente.
    // In produzione, qui ci sarebbe una chiamata al service/multiplo repository.

    const mockProfiles = [
      {
        id: 'p1',
        type: 'PROFESSIONISTA',
        displayName: 'Mario Rossi',
        roleLabel: null,
        mainContact: {
          email: 'mario.rossi@example.com',
          phone: '+39 333 1234567'
        },
        active: true,
        quality: {
          score: 92,
          level: 'HIGH',
          missingFields: ['linkedin']
        },
        permissions: {
          canViewBilling: req.user && req.user.role === 'ADMIN'
        },
        billing: req.user && req.user.role === 'ADMIN' ? {
          vatNumber: 'IT12345678901',
          iban: 'IT60X0542811101000000123456'
        } : null
      },
      {
        id: 'p2',
        type: 'AZIENDA',
        displayName: 'ACME S.p.A.',
        roleLabel: null,
        mainContact: {
          email: 'info@acme.it',
          phone: null
        },
        active: true,
        quality: {
          score: 68,
          level: 'MEDIUM',
          missingFields: ['telefono', 'indirizzo fatturazione']
        },
        permissions: {
          canViewBilling: req.user && req.user.role === 'ADMIN'
        },
        billing: req.user && req.user.role === 'ADMIN' ? {
          vatNumber: 'IT98765432109',
          iban: null
        } : null
      },
      {
        id: 'p3',
        type: 'COLLABORATORE',
        displayName: 'Giulia Bianchi',
        roleLabel: 'PMO',
        mainContact: {
          email: 'giulia.bianchi@example.com',
          phone: '+39 320 1112233'
        },
        active: false,
        quality: {
          score: 40,
          level: 'LOW',
          missingFields: ['IBAN', 'indirizzo residenza']
        },
        permissions: {
          canViewBilling: req.user && req.user.role === 'ADMIN'
        },
        billing: req.user && req.user.role === 'ADMIN' ? {
          vatNumber: null,
          iban: null
        } : null
      }
    ];

    let filtered = mockProfiles;

    if (type && type !== 'ALL') {
      filtered = filtered.filter(p => p.type === type);
    }

    if (qualityMin !== undefined) {
      const threshold = Number(qualityMin) || 0;
      filtered = filtered.filter(p => p.quality && p.quality.score >= threshold);
    }

    const dir = orderDir === 'desc' ? -1 : 1;

    const compare = (a, b) => {
      if (orderBy === 'quality') {
        const av = a.quality ? a.quality.score : 0;
        const bv = b.quality ? b.quality.score : 0;
        return (av - bv) * dir;
      }
      if (orderBy === 'type') {
        return a.type.localeCompare(b.type) * dir;
      }
      if (orderBy === 'status') {
        // attivi prima
        const av = a.active ? 1 : 0;
        const bv = b.active ? 1 : 0;
        return (av - bv) * dir;
      }
      // default name
      return a.displayName.localeCompare(b.displayName) * dir;
    };

    filtered.sort(compare);

    res.json({
      data: filtered,
      meta: {
        total: filtered.length
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in GET /api/profiles/unified', err);
    res.status(500).json({
      error: 'Errore durante il recupero dei profili unificati.'
    });
  }
});

module.exports = router;
