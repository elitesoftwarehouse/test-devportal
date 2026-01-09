import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import router esistenti (placeholder: mantenere quelli già presenti nel progetto)
// import authRouter from './routes/authRoute.js';
// import otherRouters from './routes/...';

import authMeRoute from './routes/authMeRoute.js';

const app = express();

// Middleware globali
app.use(express.json());
app.use(cookieParser());

// Configurazione CORS: assicurarsi che corrisponda a quella già definita nel progetto.
// L'opzione credentials: true è fondamentale per inviare i cookie (sessione) dal frontend.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
);

// Registrazione router esistenti
// app.use('/auth', authRouter);
// app.use('/api', otherRouters);

// Nuovo endpoint /auth/me (coerente con la story)
app.use('/auth', authMeRoute);

// Gestione errori base (mantenere coerente con implementazione esistente)
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
