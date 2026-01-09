import { isEmail } from 'validator';

export class ProfessionalProfileValidators {
  static isValidCodiceFiscale(cf: string | null | undefined): boolean {
    if (!cf) return false;
    const value = cf.trim().toUpperCase();
    // Pattern di base per CF persone fisiche italiane (senza controllo formale del carattere di controllo)
    const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
    return regex.test(value);
  }

  static isValidPartitaIva(piva: string | null | undefined): boolean {
    if (!piva) return false;
    const value = piva.replace(/\D/g, '');
    if (value.length !== 11) return false;
    // Controllo formale modulo 10
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      let n = parseInt(value.charAt(i), 10);
      if ((i + 1) % 2 === 0) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
    }
    return sum % 10 === 0;
  }

  static isValidEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return isEmail(email.trim());
  }

  static isValidPec(pec: string | null | undefined): boolean {
    if (!pec) return false;
    const value = pec.trim().toLowerCase();
    if (!isEmail(value)) return false;
    // Regola semplice: dominio deve contenere "pec" oppure ".pec."
    return value.includes('pec.');
  }

  static isValidPhone(phone: string | null | undefined): boolean {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    // Esempio semplice: minimo 6, massimo 15 cifre
    return digits.length >= 6 && digits.length <= 15;
  }
}

export function validateProfessionalProfileInput(input: {
  codiceFiscale?: string | null;
  partitaIva?: string | null;
  email?: string | null;
  pec?: string | null;
  telefono?: string | null;
  cellulare?: string | null;
}): string[] {
  const errors: string[] = [];

  if (input.codiceFiscale && !ProfessionalProfileValidators.isValidCodiceFiscale(input.codiceFiscale)) {
    errors.push('CODICE_FISCALE_INVALIDO');
  }

  if (input.partitaIva && !ProfessionalProfileValidators.isValidPartitaIva(input.partitaIva)) {
    errors.push('PARTITA_IVA_INVALIDA');
  }

  if (input.email && !ProfessionalProfileValidators.isValidEmail(input.email)) {
    errors.push('EMAIL_INVALIDA');
  }

  if (input.pec && !ProfessionalProfileValidators.isValidPec(input.pec)) {
    errors.push('PEC_INVALIDA');
  }

  if (input.telefono && !ProfessionalProfileValidators.isValidPhone(input.telefono)) {
    errors.push('TELEFONO_INVALIDO');
  }

  if (input.cellulare && !ProfessionalProfileValidators.isValidPhone(input.cellulare)) {
    errors.push('CELLULARE_INVALIDO');
  }

  return errors;
}
