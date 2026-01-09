import { Router, Request, Response } from 'express';
import { ExternalCollaboratorInvitationService } from '../../services/ExternalCollaboratorInvitationService';

export function createExternalCollaboratorsRouter(service: ExternalCollaboratorInvitationService): Router {
  const router = Router();

  router.post('/external-collaborators/invitations', async (req: Request, res: Response) => {
    const currentUserId = (req as any).user?.id;
    if (!currentUserId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'INVALID_EMAIL' });
    }

    try {
      const invitation = await service.inviteExternalCollaborator(currentUserId, { email });
      return res.status(201).json(invitation);
    } catch (err: any) {
      if (err.message === 'EMAIL_ALREADY_IN_USE') {
        return res.status(409).json({ error: 'EMAIL_ALREADY_IN_USE' });
      }
      if (err.message === 'INVITATION_ALREADY_EXISTS') {
        return res.status(409).json({ error: 'INVITATION_ALREADY_EXISTS' });
      }
      if (err.message === 'EXTERNAL_OWNER_COMPANY_NOT_FOUND') {
        return res.status(400).json({ error: 'EXTERNAL_OWNER_COMPANY_NOT_FOUND' });
      }
      if (err.message === 'MAIL_SENDING_FAILED') {
        return res.status(500).json({ error: 'MAIL_SENDING_FAILED' });
      }
      if (err.message === 'FORBIDDEN') {
        return res.status(403).json({ error: 'FORBIDDEN' });
      }
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  });

  router.post('/external-collaborators/activation', async (req: Request, res: Response) => {
    const { token, firstName, lastName, password } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'INVALID_TOKEN' });
    }
    if (!firstName || !lastName || !password) {
      return res.status(400).json({ error: 'INVALID_PAYLOAD' });
    }

    try {
      const result = await service.completeActivation({ token, firstName, lastName, password });
      return res.status(200).json(result);
    } catch (err: any) {
      if (err.message === 'INVITATION_NOT_FOUND') {
        return res.status(404).json({ error: 'INVITATION_NOT_FOUND' });
      }
      if (err.message === 'INVITATION_ALREADY_USED') {
        return res.status(409).json({ error: 'INVITATION_ALREADY_USED' });
      }
      if (err.message === 'INVITATION_EXPIRED') {
        return res.status(410).json({ error: 'INVITATION_EXPIRED' });
      }
      if (err.message === 'EMAIL_ALREADY_IN_USE') {
        return res.status(409).json({ error: 'EMAIL_ALREADY_IN_USE' });
      }
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  });

  return router;
}
