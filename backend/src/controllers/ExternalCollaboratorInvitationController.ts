import { Request, Response, Router } from 'express';
import { getRepository } from 'typeorm';
import { ExternalCollaboratorInvitation } from '../models/ExternalCollaboratorInvitation';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { ExternalCollaboratorInvitationService } from '../services/ExternalCollaboratorInvitationService';
import { authMiddleware } from '../middleware/authMiddleware';
import { getLogger } from '../utils/logger';

const logger = getLogger('ExternalCollaboratorInvitationController');

const router = Router();

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

router.post(
  '/external-collaborators/invitations',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as User;

      if (!currentUser || !(currentUser as any).roles?.includes('EXTERNAL_OWNER')) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Permessi insufficienti' });
      }

      const { email, firstName, lastName, message, companyId } = req.body || {};

      if (!email || !validateEmail(email)) {
        return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Email non valida' });
      }

      if (!companyId) {
        return res.status(400).json({ code: 'COMPANY_ID_REQUIRED', message: 'ID azienda obbligatorio' });
      }

      const service = new ExternalCollaboratorInvitationService(
        getRepository(ExternalCollaboratorInvitation),
        getRepository(User),
        getRepository(Company)
      );

      const invitation = await service.createInvitation({
        email,
        firstName,
        lastName,
        message,
        companyId,
        owner: currentUser
      });

      return res.status(201).json({
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        companyId: invitation.company.id
      });
    } catch (err: any) {
      logger.error('Error creating external collaborator invitation', { error: err.message });

      if (err.message === 'COMPANY_NOT_FOUND') {
        return res.status(404).json({ code: 'COMPANY_NOT_FOUND', message: 'Azienda non trovata' });
      }

      if (err.message === 'ACTIVE_INVITATION_ALREADY_EXISTS') {
        return res.status(409).json({
          code: 'ACTIVE_INVITATION_ALREADY_EXISTS',
          message: 'Esiste già un invito attivo per questa email e azienda'
        });
      }

      return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Errore interno del server' });
    }
  }
);

router.get('/external-collaborators/invitations/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const service = new ExternalCollaboratorInvitationService(
      getRepository(ExternalCollaboratorInvitation),
      getRepository(User),
      getRepository(Company)
    );

    const invitation = await service.getInvitationByToken(token);

    return res.status(200).json({
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      companyName: invitation.company.name,
      expiresAt: invitation.expiresAt,
      status: invitation.status
    });
  } catch (err: any) {
    logger.warn('Error fetching external collaborator invitation by token', { error: err.message });

    if (err.message === 'INVITATION_NOT_FOUND') {
      return res.status(404).json({ code: 'INVITATION_NOT_FOUND', message: 'Invito non trovato' });
    }

    if (err.message === 'INVITATION_EXPIRED') {
      return res.status(410).json({ code: 'INVITATION_EXPIRED', message: 'Invito scaduto' });
    }

    if (err.message === 'INVITATION_NOT_PENDING') {
      return res.status(409).json({ code: 'INVITATION_NOT_PENDING', message: 'Invito non più valido' });
    }

    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Errore interno del server' });
  }
});

router.post('/external-collaborators/invitations/:token/accept', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password, firstName, lastName, acceptPrivacy, acceptTerms } = req.body || {};

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res
        .status(400)
        .json({ code: 'INVALID_PASSWORD', message: 'Password non valida (minimo 8 caratteri)' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ code: 'NAME_REQUIRED', message: 'Nome e cognome sono obbligatori' });
    }

    const service = new ExternalCollaboratorInvitationService(
      getRepository(ExternalCollaboratorInvitation),
      getRepository(User),
      getRepository(Company)
    );

    const user = await service.completeInvitation({
      token,
      password,
      firstName,
      lastName,
      acceptPrivacy: !!acceptPrivacy,
      acceptTerms: !!acceptTerms
    });

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: (user as any).roles || [],
      status: 'ACTIVATED'
    });
  } catch (err: any) {
    logger.error('Error accepting external collaborator invitation', { error: err.message });

    if (err.message === 'CONSENTS_NOT_ACCEPTED') {
      return res.status(400).json({
        code: 'CONSENTS_NOT_ACCEPTED',
        message: 'È necessario accettare privacy e termini per completare la registrazione'
      });
    }

    if (err.message === 'INVITATION_NOT_FOUND') {
      return res.status(404).json({ code: 'INVITATION_NOT_FOUND', message: 'Invito non trovato' });
    }

    if (err.message === 'INVITATION_EXPIRED') {
      return res.status(410).json({ code: 'INVITATION_EXPIRED', message: 'Invito scaduto' });
    }

    if (err.message === 'INVITATION_NOT_PENDING') {
      return res.status(409).json({ code: 'INVITATION_NOT_PENDING', message: 'Invito non più valido' });
    }

    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Errore interno del server' });
  }
});

export default router;
