import express from 'express';
import bodyParser from 'body-parser';
import professionalProfileRoutes from './routes/professionalProfileRoutes';
import { HttpError } from './utils/errors';

const app = express();

app.use(bodyParser.json());

// Middleware mock autenticazione per test (in reale progetto si usa quello esistente)
app.use((req, _res, next) => {
  const anyReq = req as any;
  if (!anyReq.user) {
    // mock user id=1
    anyReq.user = { id: 1 };
  }
  next();
});

app.use('/api', professionalProfileRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, details: err.details || null } });
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: { code: 'server.error' } });
});

export default app;
