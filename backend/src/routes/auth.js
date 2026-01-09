const express = require('express');
const router = express.Router();

const { findUserByEmail, verifyPassword, getPublicUser, USER_STATUS } = require('../models/User');

/**
 * Validazione semplice dell'email.
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 3 || trimmed.length > 254) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}

/**
 * Validazione semplice della password (solo lunghezza minima).
 */
function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenziali non valide.'
      });
    }

    const user = findUserByEmail(email);

    if (!user) {
      // Non riveliamo se l'utente esiste o meno
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenziali non valide.'
      });
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({
        error: 'USER_DISABLED',
        message: 'Account disabilitato.'
      });
    }

    const passwordOk = await verifyPassword(user, password);

    if (!passwordOk) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Credenziali non valide.'
      });
    }

    // Creazione sessione sicura lato server
    req.session.userId = user.id;
    req.session.roles = user.roles || [];

    return res.json({
      user: getPublicUser(user),
      meta: {
        loginAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Errore login:', err.message);
    return res.status(500).json({
      error: 'LOGIN_ERROR',
      message: 'Errore durante il login.'
    });
  }
});

/**
 * POST /auth/logout
 */
router.post('/logout', (req, res) => {
  try {
    // Distruzione sessione lato server
    req.session = null;

    // Rimozione cookie (il nome deve combaciare con quello configurato in app.js)
    res.clearCookie('elite_sid');

    return res.json({
      success: true,
      message: 'Logout eseguito con successo.'
    });
  } catch (err) {
    console.error('Errore logout:', err.message);
    return res.status(500).json({
      error: 'LOGOUT_ERROR',
      message: 'Errore durante il logout.'
    });
  }
});

/**
 * GET /auth/me
 * Restituisce le informazioni dell'utente autenticato (se presente).
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({ user: req.user });
});

module.exports = router;
