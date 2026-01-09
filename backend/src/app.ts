import express, { Application } from 'express';
import session from 'express-session';
import rbacExampleRoutes from './routes/rbacExample.routes';

// Altri import e route esistenti vanno mantenuti
// import otherRoutes from './routes/other.routes';

const app: Application = express();

app.use(express.json());

// Esempio basico di configurazione sessione (da adattare a quella già esistente)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
  }),
);

// Montare le route esistenti
// app.use('/api', otherRoutes);

// Route di esempio per verificare il middleware RBAC
app.use('/api', rbacExampleRoutes);

export default app;
