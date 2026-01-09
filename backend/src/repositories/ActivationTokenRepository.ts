import { DataSource, Repository } from "typeorm";
import { ActivationToken } from "../entities/ActivationToken";

export class ActivationTokenRepository {
  private repository: Repository<ActivationToken>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ActivationToken);
  }

  async findValidByToken(token: string): Promise<ActivationToken | null> {
    const now = new Date();
    return this.repository.findOne({
      where: {
        token,
        usedAt: null,
        expiresAt: ({} as any) // placeholder, condition applied via query builder
      }
    });
  }

  async findValidByTokenQB(token: string): Promise<ActivationToken | null> {
    const now = new Date();
    return this.repository
      .createQueryBuilder("activation_token")
      .leftJoinAndSelect("activation_token.user", "user")
      .where("activation_token.token = :token", { token })
      .andWhere("activation_token.used_at IS NULL")
      .andWhere("activation_token.expires_at > :now", { now })
      .getOne();
  }

  async markAsUsed(entity: ActivationToken): Promise<void> {
    entity.usedAt = new Date();
    await this.repository.save(entity);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
