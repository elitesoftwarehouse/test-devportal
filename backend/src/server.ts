import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { companyFirstAccreditationRouter } from './api/routes/companyFirstAccreditation.routes';
import { logger } from './infrastructure/logger';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Middleware simulato per popolare req.user sulla base di header
// In produzione usare un vero middleware JWT/SSO coerente con il resto del progetto.
app.use((req, _res, next) => {
  const userIdHeader = req.header('x-mock-user-id');
  const userRoleHeader = req.header('x-mock-user-role');

  if (userIdHeader) {
    (req as any).user = {
      id: Number(userIdHeader),
      roles: userRoleHeader ? [userRoleHeader] : ['EXTERNAL_OWNER']
    };
  }

  next();
});

app.use('/api', companyFirstAccreditationRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info(`Backend server listening on port ${port}`);
});

export default app;
