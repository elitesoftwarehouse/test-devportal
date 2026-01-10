import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import skillProfileRouter from './routes/skillProfile.routes';
import { AuthUser } from './middleware/authRole';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Middleware di mock autenticazione per ambiente di sviluppo
// In produzione sarà sostituito con autenticazione reale (JWT/SSO)
app.use((req, _res, next) => {
  // Esempio: leggere da header x-mock-user-id e x-mock-user-role
  const userIdHeader = req.header('x-mock-user-id');
  const roleHeader = (req.header('x-mock-user-role') as AuthUser['role']) || 'STANDARD';

  if (userIdHeader) {
    (req as any).user = {
      id: parseInt(userIdHeader, 10),
      role: roleHeader,
    } as AuthUser;
  }

  next();
});

app.use('/api', skillProfileRouter);

export default app;
