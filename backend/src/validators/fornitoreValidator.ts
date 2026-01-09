import { Fornitore } from '../models/Fornitore';

export interface FornitoreCreateDTO {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string | null;
  email: string;
  telefono?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  stato?: string | null;
}

export interface FornitoreUpdateDTO extends Partial<FornitoreCreateDTO> {}

export interface FornitoreStatoUpdateDTO {
  attivo: boolean;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePartitaIva(pi: string): boolean {
  const re = /^[0-9]{11}$/;
  return re.test(pi);
}

export function validateCodiceFiscale(cf: string): boolean {
  const re = /^[A-Z0-9]{16}$/i;
  return re.test(cf);
}

export function validateFornitoreCreate(payload: any): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];

  if (!payload || typeof payload !== 'object') {
    return [
      {
        field: 'body',
        message: 'Payload non valido'
      }
    ];
  }

  const {
    ragioneSociale,
    partitaIva,
    codiceFiscale,
    email,
    telefono,
    indirizzo,
    cap,
    citta,
    provincia,
    stato
  } = payload as FornitoreCreateDTO;

  if (!ragioneSociale || typeof ragioneSociale !== 'string') {
    errors.push({ field: 'ragioneSociale', message: 'Ragione sociale obbligatoria' });
  } else if (ragioneSociale.length > 255) {
    errors.push({ field: 'ragioneSociale', message: 'Lunghezza massima 255 caratteri' });
  }

  if (!partitaIva || typeof partitaIva !== 'string') {
    errors.push({ field: 'partitaIva', message: 'Partita IVA obbligatoria' });
  } else if (!validatePartitaIva(partitaIva)) {
    errors.push({ field: 'partitaIva', message: 'Formato Partita IVA non valido (11 cifre)' });
  }

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email obbligatoria' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Formato email non valido' });
  } else if (email.length > 255) {
    errors.push({ field: 'email', message: 'Lunghezza massima 255 caratteri' });
  }

  if (codiceFiscale) {
    if (codiceFiscale.length > 16) {
      errors.push({ field: 'codiceFiscale', message: 'Lunghezza massima 16 caratteri' });
    } else if (!validateCodiceFiscale(codiceFiscale)) {
      errors.push({ field: 'codiceFiscale', message: 'Formato codice fiscale non valido' });
    }
  }

  if (telefono && telefono.length > 50) {
    errors.push({ field: 'telefono', message: 'Lunghezza massima 50 caratteri' });
  }

  if (indirizzo && indirizzo.length > 255) {
    errors.push({ field: 'indirizzo', message: 'Lunghezza massima 255 caratteri' });
  }

  if (cap && cap.length > 10) {
    errors.push({ field: 'cap', message: 'Lunghezza massima 10 caratteri' });
  }

  if (citta && citta.length > 100) {
    errors.push({ field: 'citta', message: 'Lunghezza massima 100 caratteri' });
  }

  if (provincia && provincia.length > 2) {
    errors.push({ field: 'provincia', message: 'Lunghezza massima 2 caratteri' });
  }

  if (stato && stato.length > 2) {
    errors.push({ field: 'stato', message: 'Lunghezza massima 2 caratteri' });
  }

  return errors;
}

export function validateFornitoreUpdate(payload: any): ValidationErrorItem[] {
  if (!payload || typeof payload !== 'object') {
    return [
      {
        field: 'body',
        message: 'Payload non valido'
      }
    ];
  }

  const errors: ValidationErrorItem[] = [];

  const {
    ragioneSociale,
    partitaIva,
    codiceFiscale,
    email,
    telefono,
    indirizzo,
    cap,
    citta,
    provincia,
    stato
  } = payload as FornitoreUpdateDTO;

  if (ragioneSociale !== undefined) {
    if (!ragioneSociale) {
      errors.push({ field: 'ragioneSociale', message: 'Ragione sociale non può essere vuota' });
    } else if (ragioneSociale.length > 255) {
      errors.push({ field: 'ragioneSociale', message: 'Lunghezza massima 255 caratteri' });
    }
  }

  if (partitaIva !== undefined) {
    if (!partitaIva) {
      errors.push({ field: 'partitaIva', message: 'Partita IVA non può essere vuota' });
    } else if (!validatePartitaIva(partitaIva)) {
      errors.push({ field: 'partitaIva', message: 'Formato Partita IVA non valido (11 cifre)' });
    }
  }

  if (email !== undefined) {
    if (!email) {
      errors.push({ field: 'email', message: 'Email non può essere vuota' });
    } else if (!validateEmail(email)) {
      errors.push({ field: 'email', message: 'Formato email non valido' });
    } else if (email.length > 255) {
      errors.push({ field: 'email', message: 'Lunghezza massima 255 caratteri' });
    }
  }

  if (codiceFiscale !== undefined && codiceFiscale !== null && codiceFiscale !== '') {
    if (codiceFiscale.length > 16) {
      errors.push({ field: 'codiceFiscale', message: 'Lunghezza massima 16 caratteri' });
    } else if (!validateCodiceFiscale(codiceFiscale)) {
      errors.push({ field: 'codiceFiscale', message: 'Formato codice fiscale non valido' });
    }
  }

  if (telefono !== undefined && telefono !== null && telefono.length > 50) {
    errors.push({ field: 'telefono', message: 'Lunghezza massima 50 caratteri' });
  }

  if (indirizzo !== undefined && indirizzo !== null && indirizzo.length > 255) {
    errors.push({ field: 'indirizzo', message: 'Lunghezza massima 255 caratteri' });
  }

  if (cap !== undefined && cap !== null && cap.length > 10) {
    errors.push({ field: 'cap', message: 'Lunghezza massima 10 caratteri' });
  }

  if (citta !== undefined && citta !== null && citta.length > 100) {
    errors.push({ field: 'citta', message: 'Lunghezza massima 100 caratteri' });
  }

  if (provincia !== undefined && provincia !== null && provincia.length > 2) {
    errors.push({ field: 'provincia', message: 'Lunghezza massima 2 caratteri' });
  }

  if (stato !== undefined && stato !== null && stato.length > 2) {
    errors.push({ field: 'stato', message: 'Lunghezza massima 2 caratteri' });
  }

  return errors;
}

export function validateFornitoreStatoUpdate(payload: any): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];
  if (!payload || typeof payload !== 'object') {
    return [
      {
        field: 'body',
        message: 'Payload non valido'
      }
    ];
  }

  if (payload.attivo === undefined || typeof payload.attivo !== 'boolean') {
    errors.push({ field: 'attivo', message: 'Campo attivo (boolean) obbligatorio' });
  }

  return errors;
}
