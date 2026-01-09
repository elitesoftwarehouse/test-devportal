import express from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { createExternalCollaboratorInvitationRouter } from './modules/external-collaborators/http/ExternalCollaboratorInvitationController';
import { ExternalCollaboratorInvitationService } from './modules/external-collaborators/services/ExternalCollaboratorInvitationService';
import { ExternalCollaboratorInvitationRepository } from './modules/external-collaborators/repositories/ExternalCollaboratorInvitationRepository';
import { Logger } from './shared/logger/Logger';
import { MailerService } from './shared/mailer/MailerService';

const app = express();
app.use(bodyParser.json());

// Inizializzazione dipendenze condivise (mock/dummy o reali, in linea con il progetto esistente)
const dbPool = new Pool();
const logger = new Logger();
const mailerService = new MailerService(logger, process.env);

const externalCollaboratorInvitationRepository = new ExternalCollaboratorInvitationRepository(dbPool);
const externalCollaboratorInvitationService = new ExternalCollaboratorInvitationService({
  mailerService,
  invitationRepository: externalCollaboratorInvitationRepository,
  logger,
  env: process.env
});

app.use(
  '/api',
  createExternalCollaboratorInvitationRouter(externalCollaboratorInvitationService)
);

export default app;
