import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import dei router esistenti dell'applicazione
// import timesheetRouter from './routes/timesheet.routes';
// import companiesRouter from './routes/companies.routes';
// ... altri router

import profileQualityRouter from './routes/profileQuality.routes';

const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

// Registrazione router esistenti
// app.use('/api/timesheet', timesheetRouter);
// app.use('/api/companies', companiesRouter);
// ... altri router

// Nuova rotta per la vista unificata profili / indicatori di qualità
app.use('/api/profile-quality', profileQualityRouter);

// Healthcheck di base
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
