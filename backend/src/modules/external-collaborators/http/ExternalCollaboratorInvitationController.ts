import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { ExternalCollaboratorInvitationService } from '../services/ExternalCollaboratorInvitationService';

const InviteExternalCollaboratorSchema = z.object({
  email: z.string().email(),
  externalOwnerId: z.string().uuid(),
  externalOwnerName: z.string().min(1),
  externalOwnerCompanyName: z.string().min(1),
  externalOwnerSupportEmail: z.string().email().optional(),
  locale: z.string().optional()
});

export const createExternalCollaboratorInvitationRouter = (
  invitationService: ExternalCollaboratorInvitationService
): Router => {
  const router = Router();

  router.post('/external-collaborators/invitations', async (req: Request, res: Response) => {
    const parseResult = InviteExternalCollaboratorSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        details: parseResult.error.flatten()
      });
    }

    const data = parseResult.data;

    try {
      const result = await invitationService.createAndSendInvitation({
        externalOwnerId: data.externalOwnerId,
        externalOwnerName: data.externalOwnerName,
        externalOwnerCompanyName: data.externalOwnerCompanyName,
        externalOwnerSupportEmail: data.externalOwnerSupportEmail,
        recipientEmail: data.email,
        locale: data.locale
      });

      return res.status(201).json({
        invitationId: result.invitationId,
        invitedEmail: result.invitedEmail,
        expiresAt: result.expiresAt.toISOString()
      });
    } catch (error: any) {
      if (error?.message === 'EMAIL_SEND_FAILED') {
        return res.status(502).json({ error: 'EMAIL_SEND_FAILED' });
      }

      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  });

  return router;
};
