import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import professionalProfileRoutes from './routes/professionalProfileRoutes';

export function createApp(): Application {
  const app = express();
  app.use(bodyParser.json());

  // Middleware di autenticazione fittizio per test/demo: legge X-User-Id
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const userId = req.header('X-User-Id');
    if (userId) {
      (req as any).user = { id: userId };
    }
    next();
  });

  app.use(professionalProfileRoutes);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  return app;
}
