import { CompanyCollaboratorService } from '../../src/domain/companyCollaborator/CompanyCollaboratorService';
import { InMemoryCompanyCollaboratorRepository } from '../../src/infrastructure/repositories/InMemoryCompanyCollaboratorRepository';
import { CompanyCollaboratorRole } from '../../src/domain/companyCollaborator/CompanyCollaboratorRole';
import { CompanyCollaboratorStatus } from '../../src/domain/companyCollaborator/CompanyCollaboratorStatus';

describe('CompanyCollaboratorService - unit', () => {
  let service: CompanyCollaboratorService;
  let repository: InMemoryCompanyCollaboratorRepository;

  beforeEach(() => {
    repository = new InMemoryCompanyCollaboratorRepository();
    service = new CompanyCollaboratorService(repository);
  });

  it('crea associazione collaboratore-azienda con dati validi', async () => {
    const created = await service.createAssociation({
      companyId: 'c1',
      collaboratorId: 'u1',
      role: CompanyCollaboratorRole.USER
    });

    expect(created.id).toBeDefined();
    expect(created.companyId).toBe('c1');
    expect(created.collaboratorId).toBe('u1');
    expect(created.role).toBe(CompanyCollaboratorRole.USER);
    expect(created.status).toBe(CompanyCollaboratorStatus.ATTIVO);
  });

  it('genera errore in caso di creazione duplicata', async () => {
    await service.createAssociation({
      companyId: 'c1',
      collaboratorId: 'u1',
      role: CompanyCollaboratorRole.USER
    });

    await expect(
      service.createAssociation({
        companyId: 'c1',
        collaboratorId: 'u1',
        role: CompanyCollaboratorRole.ADMIN
      })
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('modifica ruolo e verifica persistenza', async () => {
    const created = await service.createAssociation({
      companyId: 'c1',
      collaboratorId: 'u1',
      role: CompanyCollaboratorRole.USER
    });

    const updated = await service.updateAssociation(created.id, {
      role: CompanyCollaboratorRole.MANAGER
    });

    expect(updated.role).toBe(CompanyCollaboratorRole.MANAGER);
  });

  it('toggle stato ATTIVO/INATTIVO e gestione vincoli', async () => {
    const created = await service.createAssociation({
      companyId: 'c1',
      collaboratorId: 'u1',
      role: CompanyCollaboratorRole.USER
    });

    const inactivated = await service.toggleStatus(created.id, {
      status: CompanyCollaboratorStatus.INATTIVO
    });
    expect(inactivated.status).toBe(CompanyCollaboratorStatus.INATTIVO);

    const reactivated = await service.toggleStatus(created.id, {
      status: CompanyCollaboratorStatus.ATTIVO
    });
    expect(reactivated.status).toBe(CompanyCollaboratorStatus.ATTIVO);
  });

  it('validazione input errati: id inesistente', async () => {
    await expect(
      service.updateAssociation('non-esiste', { role: CompanyCollaboratorRole.USER })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });

    await expect(
      service.toggleStatus('non-esiste', { status: CompanyCollaboratorStatus.ATTIVO })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('validazione input errati: ruolo non valido', async () => {
    // @ts-expect-error test ruolo non valido
    await expect(
      service.createAssociation({ companyId: 'c1', collaboratorId: 'u1', role: 'INVALIDO' })
    ).rejects.toThrow('Ruolo non valido');

    const created = await service.createAssociation({
      companyId: 'c1',
      collaboratorId: 'u1',
      role: CompanyCollaboratorRole.USER
    });

    // @ts-expect-error test ruolo non valido
    await expect(service.updateAssociation(created.id, { role: 'INVALIDO' })).rejects.toThrow(
      'Ruolo non valido'
    );
  });

  it('validazione input errati: companyId mancante', async () => {
    // @ts-expect-error test mancanza companyId
    await expect(
      service.createAssociation({ companyId: '', collaboratorId: 'u1', role: CompanyCollaboratorRole.USER })
    ).rejects.toThrow('companyId mancante');
  });

  it('validazione input errati: collaboratorId mancante', async () => {
    // @ts-expect-error test mancanza collaboratorId
    await expect(
      service.createAssociation({ companyId: 'c1', collaboratorId: '', role: CompanyCollaboratorRole.USER })
    ).rejects.toThrow('collaboratorId mancante');
  });
});
