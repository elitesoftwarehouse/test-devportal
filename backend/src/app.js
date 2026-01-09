const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

const { seedDemoUsers } = require('./models/User');
const { authMiddleware, requireAuth, requireRoles } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware globali
app.use(bodyParser.json());
app.use(cookieParser());

// Configurazione sessione basata su cookie firmato
app.use(
  cookieSession({
    name: 'elite_sid',
    keys: [process.env.SESSION_SECRET || 'development-secret-key'],
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 ore
  })
);

// Inizializzazione utenti demo (solo sviluppo / test)
seedDemoUsers().catch((err) => {
  console.error('Errore seed utenti demo:', err.message);
});

// Popola req.user se sessione valida
app.use(authMiddleware);

// Rotte di autenticazione
app.use('/auth', authRoutes);

// Esempio di rotta protetta per testare RBAC
app.get('/api/admin/overview', requireAuth, requireRoles(['ADMIN']), (req, res) => {
  return res.json({
    message: 'Area amministrativa',
    user: req.user
  });
});

// Rotta di salute
app.get('/health', (req, res) => {
  return res.json({ status: 'ok' });
});

module.exports = app;
