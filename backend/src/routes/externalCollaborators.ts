import express, { Request, Response } from 'express';
import { ExternalCollaboratorInvitation, ExternalCollaboratorInvitationStatus } from '../models/ExternalCollaboratorInvitation';
import { requireAuth } from '../middleware/requireAuth';
import { User } from '../models/User';
import { Company } from '../models/Company';
import crypto from 'crypto';

const router = express.Router();

// Helper per generare un token univoco
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Elenco inviti collaboratori esterni per azienda corrente
router.get('/api/external-collaborators/invitations', requireAuth, async (req: Request, res: Response) => {
  const currentUser = req.user as User & { companyId?: number };

  if (!currentUser || !currentUser.companyId) {
    return res.status(400).json({ message: 'Utente non associato ad alcuna azienda.' });
  }

  const invitations = await ExternalCollaboratorInvitation.findAll({
    where: { externalOwnerCompanyId: currentUser.companyId },
    order: [['createdAt', 'DESC']]
  });

  return res.json(invitations);
});

// Creazione invito collaboratore esterno
router.post('/api/external-collaborators/invitations', requireAuth, async (req: Request, res: Response) => {
  const currentUser = req.user as User & { companyId?: number };
  const { email, tokenExpiryHours } = req.body as { email: string; tokenExpiryHours?: number };

  if (!currentUser || !currentUser.companyId) {
    return res.status(400).json({ message: 'Utente non associato ad alcuna azienda.' });
  }

  if (!email) {
    return res.status(400).json({ message: 'Email del collaboratore esterno obbligatoria.' });
  }

  const company = await Company.findByPk(currentUser.companyId);
  if (!company) {
    return res.status(404).json({ message: 'Azienda non trovata.' });
  }

  const hours = tokenExpiryHours && tokenExpiryHours > 0 ? tokenExpiryHours : 72;
  const now = new Date();
  const expiry = new Date(now.getTime() + hours * 60 * 60 * 1000);

  const token = generateInvitationToken();

  try {
    const invitation = await ExternalCollaboratorInvitation.create({
      externalOwnerCompanyId: company.id,
      externalOwnerUserId: currentUser.id,
      invitedEmail: email.toLowerCase(),
      status: ExternalCollaboratorInvitationStatus.PENDING,
      token,
      tokenExpiry: expiry,
      registrationCompleted: false
    });

    // Integrazione invio email: da implementare usando il sistema esistente di notifiche/email

    return res.status(201).json(invitation);
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Esiste già un invito attivo per questa email su questa azienda.'
      });
    }

    // Log errore secondo lo standard del progetto
    // logger.error('Errore creazione invito collaboratore esterno', err);

    return res.status(500).json({ message: 'Errore durante la creazione dell\'invito.' });
  }
});

export { router as externalCollaboratorsRouter };
