function requireAuth(req, res, next) {
  // Middleware di autenticazione semplificato.
  // Si assume che req.user venga valorizzato da un middleware precedente (JWT, sessione, ecc.)
  if (!req.user) {
    return res.status(401).json({ message: 'Non autenticato' });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Non autenticato' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'Amministratore') {
    return res.status(403).json({ message: 'Permesso negato: ruolo Amministratore richiesto' });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
