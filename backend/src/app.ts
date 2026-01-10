import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import resourceRoutes from './routes/resourceRoutes';
import resourceCvDownloadRoutes from './routes/resourceCvDownloadRoutes';

const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

// Altre route esistenti
app.use(resourceRoutes);

// Nuovo endpoint download rapido CV
app.use(resourceCvDownloadRoutes);

// Middleware di errore generico
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Errore applicativo:', err);
  if (res.headersSent) {
    return res.end();
  }
  return res.status(500).json({ message: 'Errore interno del server.' });
});

export default app;
