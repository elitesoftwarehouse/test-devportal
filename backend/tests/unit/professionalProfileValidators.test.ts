import { ProfessionalProfileValidators, validateProfessionalProfileInput } from '../../src/validators/professionalProfileValidators';

describe('ProfessionalProfileValidators', () => {
  test('valid codice fiscale', () => {
    expect(ProfessionalProfileValidators.isValidCodiceFiscale('RSSMRA85M01H501U')).toBe(true);
  });

  test('invalid codice fiscale', () => {
    expect(ProfessionalProfileValidators.isValidCodiceFiscale('ABC')).toBe(false);
  });

  test('valid partita iva', () => {
    // 01114601006 è una P.IVA valida di esempio
    expect(ProfessionalProfileValidators.isValidPartitaIva('01114601006')).toBe(true);
  });

  test('invalid partita iva', () => {
    expect(ProfessionalProfileValidators.isValidPartitaIva('12345678901')).toBe(false);
  });

  test('valid email', () => {
    expect(ProfessionalProfileValidators.isValidEmail('test@example.com')).toBe(true);
  });

  test('invalid email', () => {
    expect(ProfessionalProfileValidators.isValidEmail('not-an-email')).toBe(false);
  });

  test('valid pec', () => {
    expect(ProfessionalProfileValidators.isValidPec('studio@pec.example.it')).toBe(true);
  });

  test('invalid pec', () => {
    expect(ProfessionalProfileValidators.isValidPec('studio@example.it')).toBe(false);
  });

  test('valid phone', () => {
    expect(ProfessionalProfileValidators.isValidPhone('+39 0123 456789')).toBe(true);
  });

  test('invalid phone too short', () => {
    expect(ProfessionalProfileValidators.isValidPhone('12')).toBe(false);
  });

  test('validateProfessionalProfileInput returns error codes', () => {
    const errors = validateProfessionalProfileInput({
      codiceFiscale: 'ABC',
      partitaIva: '123',
      email: 'xx',
      pec: 'yy',
      telefono: '1',
      cellulare: '2',
    });
    expect(errors).toEqual([
      'CODICE_FISCALE_INVALIDO',
      'PARTITA_IVA_INVALIDA',
      'EMAIL_INVALIDA',
      'PEC_INVALIDA',
      'TELEFONO_INVALIDO',
      'CELLULARE_INVALIDO',
    ]);
  });
});
