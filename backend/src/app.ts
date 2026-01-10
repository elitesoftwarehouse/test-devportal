import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { ExternalCollaboratorInvitationRepository } from './repositories/ExternalCollaboratorInvitationRepository';
import { UserRepository } from './repositories/UserRepository';
import { ExternalCollaboratorInvitationService } from './services/ExternalCollaboratorInvitationService';
import { createExternalCollaboratorsRouter } from './api/routes/externalCollaborators';
import { AuthorizationService } from './services/AuthorizationService';
import { Mailer } from './services/Mailer';
import profileQualityRouter from './routes/profileQuality.routes';

const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

// Integrazione con pool DB esistente (configurazione da env)
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const userRepository = new UserRepository(db);
const invitationRepository = new ExternalCollaboratorInvitationRepository(db);
const authorizationService = new AuthorizationService(userRepository);

const mailer: Mailer = {
  async sendExternalCollaboratorInvitation({ to, token, companyId }) {
    // Implementazione reale delegata al mailer esistente.
    console.log('Sending invitation email', { to, token, companyId });
  },
};

const invitationService = new ExternalCollaboratorInvitationService(
  invitationRepository,
  userRepository,
  mailer,
  authorizationService,
);

// Middleware di autenticazione placeholder (da sostituire con quello reale dell'app)
app.use((req, _res, next) => {
  // In un contesto reale, req.user è impostato dal middleware auth JWT/Sessione
  (req as any).user = (req as any).user || null;
  next();
});

// External Collaborators API
app.use('/api', createExternalCollaboratorsRouter(invitationService));

// Profile Quality API
app.use('/api/profile-quality', profileQualityRouter);

// Healthcheck di base
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export { app };
export default app;
