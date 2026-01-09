import { UserRepository } from '../repositories/UserRepository';

export class AuthorizationService {
  constructor(private readonly userRepository: UserRepository) {}

  async assertCanInviteExternalCollaborator(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('FORBIDDEN');
    }
    if (!user.roles?.includes('EXTERNAL_OWNER')) {
      throw new Error('FORBIDDEN');
    }
  }
}
