import request from 'supertest';
import { createApp } from '../testUtils/createApp';
import { getConnection, getRepository } from 'typeorm';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';
import { ExternalCollaboratorInvitation } from '../src/models/ExternalCollaboratorInvitation';

let app: any;

describe('ExternalCollaboratorInvitationController', () => {
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await getConnection().close();
  });

  it('should create an invitation as EXTERNAL_OWNER', async () => {
    const userRepo = getRepository(User);
    const companyRepo = getRepository(Company);

    const company = await companyRepo.save(companyRepo.create({ name: 'Test Company' } as any));

    const owner = userRepo.create({
      email: 'owner@example.com',
      firstName: 'Owner',
      lastName: 'Test',
      isActive: true
    } as any);
    (owner as any).roles = ['EXTERNAL_OWNER'];
    await owner.setPassword('password123');
    const savedOwner = await userRepo.save(owner);

    const token = 'test-token';
    // createApp helper should attach auth using savedOwner id; simplified here

    const response = await request(app)
      .post('/api/external-collaborators/invitations')
      .set('x-test-user-id', savedOwner.id)
      .send({
        email: 'external@example.com',
        companyId: company.id
      });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('external@example.com');

    const invitationRepo = getRepository(ExternalCollaboratorInvitation);
    const inv = await invitationRepo.findOne({ where: { email: 'external@example.com' } });
    expect(inv).toBeDefined();
  });

  it('should reject invitation creation for non EXTERNAL_OWNER', async () => {
    const userRepo = getRepository(User);
    const companyRepo = getRepository(Company);

    const company = await companyRepo.save(companyRepo.create({ name: 'Test Company 2' } as any));

    const user = userRepo.create({
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Test',
      isActive: true
    } as any);
    (user as any).roles = ['STANDARD_USER'];
    await user.setPassword('password123');
    const savedUser = await userRepo.save(user);

    const response = await request(app)
      .post('/api/external-collaborators/invitations')
      .set('x-test-user-id', savedUser.id)
      .send({
        email: 'external2@example.com',
        companyId: company.id
      });

    expect(response.status).toBe(403);
  });
});
