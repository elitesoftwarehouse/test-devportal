import { DataSource } from "typeorm";
import { ActivationTokenRepository } from "../repositories/ActivationTokenRepository";
import { User } from "../entities/User";
import { UserStatus } from "../models/UserStatus";

export interface ActivationResult {
  success: boolean;
  code:
    | "ACTIVATION_SUCCESS"
    | "TOKEN_INVALID"
    | "TOKEN_EXPIRED"
    | "TOKEN_USED"
    | "USER_NOT_FOUND"
    | "ACCOUNT_ALREADY_ACTIVE";
  message: string;
}

export class AuthActivationService {
  private dataSource: DataSource;
  private tokenRepository: ActivationTokenRepository;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.tokenRepository = new ActivationTokenRepository(dataSource);
  }

  async activateByToken(token: string): Promise<ActivationResult> {
    if (!token) {
      return {
        success: false,
        code: "TOKEN_INVALID",
        message: "Token di attivazione mancante o non valido."
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tokenRepo = queryRunner.manager.getRepository("activation_tokens");
      const userRepo = queryRunner.manager.getRepository(User);
      const now = new Date();

      const activationToken = await tokenRepo
        .createQueryBuilder("activation_token")
        .leftJoinAndSelect("activation_token.user", "user")
        .where("activation_token.token = :token", { token })
        .getOne();

      if (!activationToken) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          code: "TOKEN_INVALID",
          message: "Il token di attivazione non è valido."
        };
      }

      if (activationToken.usedAt) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          code: "TOKEN_USED",
          message: "Il link di attivazione è già stato utilizzato."
        };
      }

      if (activationToken.expiresAt <= now) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Il link di attivazione è scaduto."
        };
      }

      const user = activationToken.user
        ? activationToken.user
        : await userRepo.findOne({ where: { id: activationToken.userId } });

      if (!user) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          code: "USER_NOT_FOUND",
          message: "Utente associato al token non trovato."
        };
      }

      if (user.status === UserStatus.ACTIVE) {
        activationToken.usedAt = now;
        await tokenRepo.save(activationToken);
        await queryRunner.commitTransaction();
        return {
          success: true,
          code: "ACCOUNT_ALREADY_ACTIVE",
          message: "L'account risulta già attivo. Puoi effettuare l'accesso."
        };
      }

      user.status = UserStatus.ACTIVE;
      activationToken.usedAt = now;

      await userRepo.save(user);
      await tokenRepo.save(activationToken);

      await queryRunner.commitTransaction();

      return {
        success: true,
        code: "ACTIVATION_SUCCESS",
        message: "Account attivato correttamente. Ora puoi effettuare il login."
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
