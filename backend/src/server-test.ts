import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import competenceProfileTestRouter from './routes/test/competenceProfileTestRouter';

/**
 * Server Express semplificato usato esclusivamente per i test end-to-end UI (Cypress).
 * Espone gli endpoint mockati per il profilo competenze.
 */

export function createTestServer(): Application {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.use('/api/test/competence-profile', competenceProfileTestRouter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: 'test' });
  });

  return app;
}

if (require.main === module) {
  const app = createTestServer();
  const port = process.env.PORT || 4001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Test server listening on port ${port}`);
  });
}
