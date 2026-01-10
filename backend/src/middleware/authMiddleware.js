function requireAuth(req, res, next) {
  // Middleware semplificato: si assume che req.user sia già popolato
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Autenticazione richiesta' });
  }
  return next();
}

module.exports = { requireAuth };
