const { findUserById, getPublicUser } = require('../models/User');

/**
 * Middleware di autenticazione basato su sessione (cookie firmato).
 * Popola req.user con i dettagli utente se autenticato.
 */
function authMiddleware(req, res, next) {
  try {
    const session = req.session || {};
    const userId = session.userId;

    if (!userId) {
      req.user = null;
      return next();
    }

    const user = findUserById(userId);
    if (!user) {
      // Sessione non valida: pulisco e continuo come non autenticato
      req.session = null;
      req.user = null;
      return next();
    }

    req.user = {
      ...getPublicUser(user)
    };

    return next();
  } catch (err) {
    // In caso di errore non blocchiamo la richiesta, ma non consideriamo l'utente autenticato
    req.user = null;
    return next();
  }
}

/**
 * Middleware per richiedere che l'utente sia autenticato.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Autenticazione richiesta.'
    });
  }
  return next();
}

/**
 * Middleware per richiedere che l'utente abbia almeno uno dei ruoli richiesti.
 * @param {string[]} roles
 */
function requireRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Autenticazione richiesta.'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Permessi insufficienti.'
      });
    }

    return next();
  };
}

module.exports = {
  authMiddleware,
  requireAuth,
  requireRoles
};
