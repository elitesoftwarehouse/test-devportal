import { ProfessionalProfileService } from '../../src/services/ProfessionalProfileService';
import { ProfessionalProfile } from '../../src/models/ProfessionalProfile';
import { Repository } from 'typeorm';

function createMockRepository(): jest.Mocked<Repository<ProfessionalProfile>> {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as any;
}

describe('ProfessionalProfileService - unit', () => {
  let repo: jest.Mocked<Repository<ProfessionalProfile>>;
  let service: ProfessionalProfileService;

  beforeEach(() => {
    repo = createMockRepository();
    service = new ProfessionalProfileService(repo);
  });

  test('createProfileForUser crea un nuovo profilo con mappatura corretta', async () => {
    repo.findOne.mockResolvedValue(null);
    const entity = new ProfessionalProfile();
    repo.create.mockReturnValue(entity);
    repo.save.mockImplementation(async (e: ProfessionalProfile) => {
      e.id = 'profile-1';
      return e;
    });

    const dto = await service.createProfileForUser('user-1', {
      nome: ' Mario ',
      cognome: ' Rossi ',
      codiceFiscale: ' RSSMRA85M01H501U ',
      provincia: ' mi ',
    });

    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(dto.id).toBe('profile-1');
    expect(dto.nome).toBe('Mario');
    expect(dto.cognome).toBe('Rossi');
    expect(dto.codiceFiscale).toBe('RSSMRA85M01H501U');
    expect(dto.provincia).toBe('MI');
  });

  test('createProfileForUser rifiuta creazione se profilo esiste', async () => {
    repo.findOne.mockResolvedValue({} as ProfessionalProfile);

    await expect(
      service.createProfileForUser('user-1', { nome: 'Mario', cognome: 'Rossi' }),
    ).rejects.toThrow('PROFILE_ALREADY_EXISTS');
  });

  test('createProfileForUser valida input e lancia VALIDATION_ERROR', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(new ProfessionalProfile());

    await expect(
      service.createProfileForUser('user-1', {
        nome: 'Mario',
        cognome: 'Rossi',
        codiceFiscale: 'ABC',
      }),
    ).rejects.toThrow('VALIDATION_ERROR');
  });

  test('updateProfileForUser aggiorna campi opzionali con null quando vuoti', async () => {
    const existing = new ProfessionalProfile();
    existing.id = 'p1';
    existing.userId = 'user-1';
    existing.nome = 'Mario';
    existing.cognome = 'Rossi';
    existing.codiceFiscale = 'RSSMRA85M01H501U';
    existing.partitaIva = '01114601006';

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (e: ProfessionalProfile) => e);

    const dto = await service.updateProfileForUser('user-1', {
      nome: 'Mario',
      cognome: 'Rossi',
      codiceFiscale: '',
      partitaIva: null,
    } as any);

    expect(repo.save).toHaveBeenCalled();
    expect(dto.codiceFiscale).toBeNull();
    expect(dto.partitaIva).toBeNull();
  });

  test('getProfileByUserId lancia PROFILE_NOT_FOUND se assente', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.getProfileByUserId('user-1', 'user-1')).rejects.toThrow('PROFILE_NOT_FOUND');
  });

  test('regole di autorizzazione: utente non può leggere profilo di altri', async () => {
    await expect(service.getProfileByUserId('user-1', 'user-2')).rejects.toThrow('FORBIDDEN');
  });

  test('regole di autorizzazione: utente non può creare profilo per altri', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.createProfileForUser('user-1', { userId: 'user-2', nome: 'A', cognome: 'B' }),
    ).rejects.toThrow('FORBIDDEN');
  });

  test('regole di autorizzazione: utente non può aggiornare profilo di altri', async () => {
    await expect(
      service.updateProfileForUser('user-1', { userId: 'user-2', nome: 'A', cognome: 'B' }),
    ).rejects.toThrow('FORBIDDEN');
  });
});
