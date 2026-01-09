import { Request, Response, NextFunction } from 'express';
import { getUnifiedProfiles } from './profile.service';
import { AuthenticatedRequest } from '../shared/auth.types';

export async function getUnifiedProfilesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    const {
      type = 'ALL',
      search,
      companyId,
      active,
      limit = '50',
      offset = '0',
    } = req.query as Record<string, string | undefined>;

    const parsedLimit = Number.isNaN(Number(limit)) ? 50 : Number(limit);
    const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

    const result = await getUnifiedProfiles({
      type: (type || 'ALL') as any,
      search: search || undefined,
      companyId: companyId ? Number(companyId) : undefined,
      active:
        typeof active === 'string'
          ? active.toLowerCase() === 'true'
          : undefined,
      limit: parsedLimit,
      offset: parsedOffset,
      currentUser: authReq.user,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
