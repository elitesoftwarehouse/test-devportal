import express from 'express';
import bodyParser from 'body-parser';
import { companyCollaboratorRoutes } from './routes/companyCollaboratorRoutes';
import { mockAuthMiddleware } from './middleware/authMiddleware';

export const createServer = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(mockAuthMiddleware);
  app.use('/api', companyCollaboratorRoutes);
  return app;
};

if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server in ascolto sulla porta ${port}`);
  });
}
