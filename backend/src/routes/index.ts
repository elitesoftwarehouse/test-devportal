import { Router } from 'express';
import externalCollaboratorInvitationController from '../controllers/ExternalCollaboratorInvitationController';
// import di altri controller esistenti...

const router = Router();

// mount degli altri router...

router.use('/api', externalCollaboratorInvitationController);

export default router;
