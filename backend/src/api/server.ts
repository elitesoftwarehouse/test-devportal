import express from 'express';
import bodyParser from 'body-parser';
import knex, { Knex } from 'knex';
import { createCollaboratorCvRouter } from './routes/collaboratorCvRoutes';

// Configurazione di esempio; nella codebase reale usare la config esistente.
const dbConfig: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/elite_portal',
};

const db = knex(dbConfig);

const app = express();
app.use(bodyParser.json());

// Middleware placeholder per utente corrente; sostituire con auth reale.
app.use((req, _res, next) => {
  (req as any).user = { id: '00000000-0000-0000-0000-000000000001' };
  next();
});

app.use(createCollaboratorCvRouter(db));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Errore interno del server' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server in ascolto sulla porta ${port}`);
});
