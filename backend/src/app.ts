import express from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { ExternalCollaboratorInvitationRepository } from './repositories/ExternalCollaboratorInvitationRepository';
import { UserRepository } from './repositories/UserRepository';
import { ExternalCollaboratorInvitationService } from './services/ExternalCollaboratorInvitationService';
import { createExternalCollaboratorsRouter } from './api/routes/externalCollaborators';
import { AuthorizationService } from './services/AuthorizationService';
import { Mailer } from './services/Mailer';

const app = express();
app.use(bodyParser.json());

// Integrazione con pool DB esistente (configurazione da env)
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const userRepository = new UserRepository(db);
const invitationRepository = new ExternalCollaboratorInvitationRepository(db);
const authorizationService = new AuthorizationService(userRepository);

const mailer: Mailer = {
  async sendExternalCollaboratorInvitation({ to, token, companyId }) {
    // Implementazione reale delegata al mailer esistente.
    // Qui solo un placeholder per completezza.
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

app.use('/api', createExternalCollaboratorsRouter(invitationService));

export { app };
