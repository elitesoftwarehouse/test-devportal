import { Request, Response, NextFunction } from 'express';
import { professionalProfileService, ProfessionalProfileInput } from '../services/professionalProfileService';
import { HttpError, NotFoundError, ValidationError } from '../utils/errors';

function getAuthenticatedUserId(req: Request): number {
  const anyReq = req as any;
  if (!anyReq.user || !anyReq.user.id) {
    throw new HttpError(401, 'auth.unauthorized');
  }
  return anyReq.user.id as number;
}

export class ProfessionalProfileController {
  async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getAuthenticatedUserId(req);
      const profile = await professionalProfileService.getCurrentProfile(userId);
      if (!profile) {
        throw new NotFoundError('professionalProfile.notFound');
      }
      res.status(200).json({ data: profile });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getAuthenticatedUserId(req);
      const input = req.body as ProfessionalProfileInput;
      const profile = await professionalProfileService.createProfile(userId, input);
      res.status(201).json({ data: profile });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getAuthenticatedUserId(req);
      const input = req.body as ProfessionalProfileInput;
      const profile = await professionalProfileService.updateProfile(userId, input);
      res.status(200).json({ data: profile });
    } catch (err) {
      next(err);
    }
  }
}

export const professionalProfileController = new ProfessionalProfileController();
