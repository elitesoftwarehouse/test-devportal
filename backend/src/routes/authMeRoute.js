import express from 'express';

// Questo file segue lo stesso pattern degli altri router di autenticazione esistenti.
// Espone l'endpoint GET /auth/me che restituisce le informazioni non sensibili
// dell'utente autenticato (id, email, ruoli), prendendole dall'oggetto req.user
// popolato dal middleware di autenticazione (es. sessione, JWT in cookie, ecc.).

const router = express.Router();

// Middleware di esempio per garantire coerenza: si assume che nel progetto sia già
// presente un middleware di autenticazione che valorizza req.user quando la sessione
// è valida. Se esiste già un middleware come `requireAuth`, può essere usato qui.

function ensureAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Sessione non valida o scaduta.'
    });
  }
  return next();
}

router.get('/me', ensureAuthenticated, (req, res) => {
  // Estrarre solo campi non sensibili dall'utente autenticato
  const safeUser = {
    id: req.user.id,
    email: req.user.email,
    roles: Array.isArray(req.user.roles) ? req.user.roles : [],
    displayName: req.user.displayName || null
  };

  return res.status(200).json({
    success: true,
    user: safeUser
  });
});

export default router;
