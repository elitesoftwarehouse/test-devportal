/**
 * Middleware di autorizzazione semplice per consentire l'accesso solo agli amministratori.
 * In questo esempio, assumiamo che req.user sia popolato da un middleware di autenticazione
 * precedente e che contenga un campo role con valore 'admin' per gli amministratori.
 */
function authAdmin(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Non autenticato' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato: solo amministratori' });
  }

  return next();
}

module.exports = {
  authAdmin
};
