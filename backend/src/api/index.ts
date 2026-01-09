import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import companyCollaboratorRoutes from './routes/companyCollaborator.routes';
import { HttpError } from '../errors/httpErrors';

const app = express();

app.use(bodyParser.json());

// Middleware di esempio per simulare autenticazione
app.use((req: Request, _res: Response, next: NextFunction) => {
  // Integrazione reale: leggere token JWT e popolare req.user
  (req as any).user = {
    id: 'mock-user-id',
    roles: ['ADMIN'],
  };
  next();
});

app.use('/api', companyCollaboratorRoutes);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Errore interno del server' });
});

export default app;
