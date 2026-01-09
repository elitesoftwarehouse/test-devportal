import express from 'express';
import bodyParser from 'body-parser';
import profileRoutes from './api/profile/profile.routes';

const app = express();

app.use(bodyParser.json());

app.use('/api/profiles', profileRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Errore interno del server' });
});

export default app;
