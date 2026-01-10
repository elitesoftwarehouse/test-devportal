import express, { Application } from 'express';
import bodyParser from 'body-parser';
import collaboratorCvDesignRouter from './routes/collaboratorCvDesign.routes';

export function createCollaboratorCvDesignApp(): Application {
  const app = express();
  app.use(bodyParser.json());
  app.use('/design', collaboratorCvDesignRouter);
  return app;
}

if (require.main === module) {
  const app = createCollaboratorCvDesignApp();
  const port = Number(process.env.PORT || 4005);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Collaborator CV design API running on http://localhost:${port}/design/collaborator-cv`);
  });
}
