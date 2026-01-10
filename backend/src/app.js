import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

// Import router esistenti
import authMeRoute from './routes/authMeRoute.js';
const profileUnifiedRoutes = require('./routes/profileUnifiedRoutes');

const app = express();

// Middleware globali
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// Configurazione CORS: assicurarsi che corrisponda a quella già definita nel progetto.
// L'opzione credentials: true è fondamentale per inviare i cookie (sessione) dal frontend.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
);

// Middleware per simulare l'utente loggato (solo per sviluppo)
app.use((req, res, next) => {
  // In produzione questo verrebbe da un sistema di auth/JWT
  if (!req.user) {
    req.user = { id: 'u1', role: process.env.MOCK_ROLE || 'ADMIN' };
  }
  next();
});

// Registrazione router
app.use('/auth', authMeRoute);
app.use('/api/profiles', profileUnifiedRoutes);

// Gestione errori base
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Errore interno del server.'
  });
});

export default app;
