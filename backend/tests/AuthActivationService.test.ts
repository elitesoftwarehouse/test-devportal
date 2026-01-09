import "reflect-metadata";
import { DataSource } from "typeorm";
import { AuthActivationService } from "../src/services/AuthActivationService";
import { User } from "../src/entities/User";
import { ActivationToken } from "../src/entities/ActivationToken";
import { UserStatus } from "../src/models/UserStatus";

let dataSource: DataSource;

beforeAll(async () => {
  dataSource = new DataSource({
    type: "sqljs",
    synchronize: true,
    entities: [User, ActivationToken]
  });
  await dataSource.initialize();
});

afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

describe("AuthActivationService", () => {
  it("attiva correttamente un account con token valido", async () => {
    const userRepo = dataSource.getRepository(User);
    const tokenRepo = dataSource.getRepository(ActivationToken);

    const user = await userRepo.save(
      userRepo.create({
        email: "test@example.com",
        passwordHash: "hash",
        status: UserStatus.PENDING_ACTIVATION
      })
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const token = await tokenRepo.save(
      tokenRepo.create({
        token: "test-token",
        userId: user.id,
        expiresAt,
        usedAt: null
      })
    );

    const service = new AuthActivationService(dataSource);
    const result = await service.activateByToken("test-token");

    expect(result.success).toBe(true);
    expect(result.code).toBe("ACTIVATION_SUCCESS");

    const updatedUser = await userRepo.findOneByOrFail({ id: user.id });
    const updatedToken = await tokenRepo.findOneByOrFail({ id: token.id });

    expect(updatedUser.status).toBe(UserStatus.ACTIVE);
    expect(updatedToken.usedAt).not.toBeNull();
  });

  it("rifiuta token scaduto", async () => {
    const userRepo = dataSource.getRepository(User);
    const tokenRepo = dataSource.getRepository(ActivationToken);

    const user = await userRepo.save(
      userRepo.create({
        email: "expired@example.com",
        passwordHash: "hash",
        status: UserStatus.PENDING_ACTIVATION
      })
    );

    const expiresAt = new Date(Date.now() - 60 * 60 * 1000);
    await tokenRepo.save(
      tokenRepo.create({
        token: "expired-token",
        userId: user.id,
        expiresAt,
        usedAt: null
      })
    );

    const service = new AuthActivationService(dataSource);
    const result = await service.activateByToken("expired-token");

    expect(result.success).toBe(false);
    expect(result.code).toBe("TOKEN_EXPIRED");
  });
});
