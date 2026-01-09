import express, { Application } from 'express';
import { json } from 'body-parser';
import { DataSource } from 'typeorm';
import { accreditamentoRouter } from './routes/accreditamento/accreditamento.controller';
import { testingRouter } from './routes/testing';

interface CreateAppOptions {
  dataSource: DataSource;
  enableGraphql?: boolean;
}

export async function createApp(options: CreateAppOptions): Promise<Application> {
  const app = express();
  app.use(json());

  app.use((req, _res, next) => {
    (req as any).dataSource = options.dataSource;
    next();
  });

  app.use('/api/accreditamento', accreditamentoRouter);
  app.use('/api/testing', testingRouter);

  if (options.enableGraphql) {
    // Qui verrebbe montato il server GraphQL secondo le convenzioni esistenti
  }

  return app;
}
