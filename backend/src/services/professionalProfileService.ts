import { professionalProfileRepository, ProfessionalProfileUpdatePayload } from '../repositories/professionalProfileRepository';
import ProfessionalProfile, { ProfessionalProfileCreationAttributes } from '../models/ProfessionalProfile';
import { ValidationError } from '../utils/errors';
import { Logger } from '../utils/logger';

const logger = new Logger('ProfessionalProfileService');

export interface ProfessionalProfileDTO {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  pecEmail?: string | null;
  sdiCode?: string | null;
}

export interface ProfessionalProfileInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  pecEmail?: string | null;
  sdiCode?: string | null;
}

function toDTO(model: ProfessionalProfile): ProfessionalProfileDTO {
  return {
    id: model.id,
    userId: model.userId,
    firstName: model.firstName,
    lastName: model.lastName,
    dateOfBirth: model.dateOfBirth ? model.dateOfBirth.toISOString().substring(0, 10) : null,
    placeOfBirth: model.placeOfBirth,
    taxCode: model.taxCode,
    vatNumber: model.vatNumber,
    address: model.address,
    zipCode: model.zipCode,
    city: model.city,
    province: model.province,
    country: model.country,
    phone: model.phone,
    mobilePhone: model.mobilePhone,
    email: model.email,
    pecEmail: model.pecEmail,
    sdiCode: model.sdiCode,
  };
}

function validateEmail(email?: string | null, field: string = 'email'): void {
  if (!email) return;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw new ValidationError('validation.invalidEmail', { field });
  }
}

function validateItalianMobile(mobile?: string | null): void {
  if (!mobile) return;
  const re = /^\+?\d{8,15}$/;
  if (!re.test(mobile)) {
    throw new ValidationError('validation.invalidMobilePhone', {});
  }
}

function validateZipCode(zip?: string | null): void {
  if (!zip) return;
  const re = /^\d{5}$/;
  if (!re.test(zip)) {
    throw new ValidationError('validation.invalidZipCode', {});
  }
}

function validateTaxCode(cf?: string | null): void {
  if (!cf) return;
  const re = /^[A-Z0-9]{11,16}$/i;
  if (!re.test(cf)) {
    throw new ValidationError('validation.invalidTaxCode', {});
  }
}

function validateVatNumber(piva?: string | null): void {
  if (!piva) return;
  const re = /^\d{11}$/;
  if (!re.test(piva)) {
    throw new ValidationError('validation.invalidVatNumber', {});
  }
}

function validatePec(pec?: string | null): void {
  if (!pec) return;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(pec)) {
    throw new ValidationError('validation.invalidPec', {});
  }
}

function validateRequiredForUsage(input: ProfessionalProfileInput): void {
  if (!input.firstName || input.firstName.trim().length === 0) {
    throw new ValidationError('validation.required', { field: 'firstName' });
  }
  if (!input.lastName || input.lastName.trim().length === 0) {
    throw new ValidationError('validation.required', { field: 'lastName' });
  }
  if (!input.taxCode && !input.vatNumber) {
    throw new ValidationError('validation.taxCodeOrVatRequired', {});
  }
}

function validateLengths(input: ProfessionalProfileInput): void {
  const checks: Array<[string, string | null | undefined, number]> = [
    ['firstName', input.firstName, 100],
    ['lastName', input.lastName, 100],
    ['placeOfBirth', input.placeOfBirth, 150],
    ['address', input.address, 255],
    ['zipCode', input.zipCode, 10],
    ['city', input.city, 150],
    ['province', input.province, 50],
    ['country', input.country, 100],
    ['phone', input.phone, 20],
    ['mobilePhone', input.mobilePhone, 20],
    ['email', input.email, 255],
    ['pecEmail', input.pecEmail, 255],
    ['sdiCode', input.sdiCode, 7],
  ];
  for (const [field, value, max] of checks) {
    if (value && value.length > max) {
      throw new ValidationError('validation.maxLength', { field, max });
    }
  }
}

function normalizeInput(input: ProfessionalProfileInput): ProfessionalProfileInput {
  return {
    ...input,
    firstName: input.firstName?.trim(),
    lastName: input.lastName?.trim(),
    email: input.email?.trim().toLowerCase() || null,
    pecEmail: input.pecEmail?.trim().toLowerCase() || null,
    taxCode: input.taxCode?.trim().toUpperCase() || null,
    vatNumber: input.vatNumber?.trim() || null,
    sdiCode: input.sdiCode?.trim().toUpperCase() || null,
  };
}

function toCreationPayload(userId: number, input: ProfessionalProfileInput): ProfessionalProfileCreationAttributes {
  return {
    userId,
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
    placeOfBirth: input.placeOfBirth || null,
    taxCode: input.taxCode || null,
    vatNumber: input.vatNumber || null,
    address: input.address || null,
    zipCode: input.zipCode || null,
    city: input.city || null,
    province: input.province || null,
    country: input.country || 'Italia',
    phone: input.phone || null,
    mobilePhone: input.mobilePhone || null,
    email: input.email || null,
    pecEmail: input.pecEmail || null,
    sdiCode: input.sdiCode || null,
  };
}

function toUpdatePayload(input: ProfessionalProfileInput): ProfessionalProfileUpdatePayload {
  const payload: ProfessionalProfileUpdatePayload = {};
  if (input.firstName !== undefined) payload.firstName = input.firstName;
  if (input.lastName !== undefined) payload.lastName = input.lastName;
  if (input.dateOfBirth !== undefined) payload.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
  if (input.placeOfBirth !== undefined) payload.placeOfBirth = input.placeOfBirth || null;
  if (input.taxCode !== undefined) payload.taxCode = input.taxCode || null;
  if (input.vatNumber !== undefined) payload.vatNumber = input.vatNumber || null;
  if (input.address !== undefined) payload.address = input.address || null;
  if (input.zipCode !== undefined) payload.zipCode = input.zipCode || null;
  if (input.city !== undefined) payload.city = input.city || null;
  if (input.province !== undefined) payload.province = input.province || null;
  if (input.country !== undefined) payload.country = input.country || null;
  if (input.phone !== undefined) payload.phone = input.phone || null;
  if (input.mobilePhone !== undefined) payload.mobilePhone = input.mobilePhone || null;
  if (input.email !== undefined) payload.email = input.email || null;
  if (input.pecEmail !== undefined) payload.pecEmail = input.pecEmail || null;
  if (input.sdiCode !== undefined) payload.sdiCode = input.sdiCode || null;
  return payload;
}

export class ProfessionalProfileService {
  async getCurrentProfile(userId: number): Promise<ProfessionalProfileDTO | null> {
    const profile = await professionalProfileRepository.findByUserId(userId);
    if (!profile) return null;
    return toDTO(profile);
  }

  async createProfile(userId: number, input: ProfessionalProfileInput): Promise<ProfessionalProfileDTO> {
    const existing = await professionalProfileRepository.findByUserId(userId);
    if (existing) {
      throw new ValidationError('professionalProfile.alreadyExists', {});
    }

    const normalized = normalizeInput(input);
    validateRequiredForUsage(normalized);
    validateLengths(normalized);
    validateEmail(normalized.email, 'email');
    validateEmail(normalized.pecEmail, 'pecEmail');
    validateItalianMobile(normalized.mobilePhone);
    validateZipCode(normalized.zipCode);
    validateTaxCode(normalized.taxCode);
    validateVatNumber(normalized.vatNumber);
    validatePec(normalized.pecEmail);

    const payload = toCreationPayload(userId, normalized);

    logger.info('Creating professional profile', { userId });
    const created = await professionalProfileRepository.createForUser(userId, payload);
    return toDTO(created);
  }

  async updateProfile(userId: number, input: ProfessionalProfileInput): Promise<ProfessionalProfileDTO> {
    const existing = await professionalProfileRepository.findByUserId(userId);
    if (!existing) {
      throw new ValidationError('professionalProfile.notFound', {});
    }

    const merged: ProfessionalProfileInput = {
      firstName: input.firstName ?? existing.firstName,
      lastName: input.lastName ?? existing.lastName,
      dateOfBirth: input.dateOfBirth !== undefined
        ? input.dateOfBirth
        : existing.dateOfBirth
          ? existing.dateOfBirth.toISOString().substring(0, 10)
          : null,
      placeOfBirth: input.placeOfBirth !== undefined ? input.placeOfBirth : existing.placeOfBirth,
      taxCode: input.taxCode !== undefined ? input.taxCode : existing.taxCode,
      vatNumber: input.vatNumber !== undefined ? input.vatNumber : existing.vatNumber,
      address: input.address !== undefined ? input.address : existing.address,
      zipCode: input.zipCode !== undefined ? input.zipCode : existing.zipCode,
      city: input.city !== undefined ? input.city : existing.city,
      province: input.province !== undefined ? input.province : existing.province,
      country: input.country !== undefined ? input.country : existing.country,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      mobilePhone: input.mobilePhone !== undefined ? input.mobilePhone : existing.mobilePhone,
      email: input.email !== undefined ? input.email : existing.email,
      pecEmail: input.pecEmail !== undefined ? input.pecEmail : existing.pecEmail,
      sdiCode: input.sdiCode !== undefined ? input.sdiCode : existing.sdiCode,
    };

    const normalized = normalizeInput(merged);
    validateRequiredForUsage(normalized);
    validateLengths(normalized);
    validateEmail(normalized.email, 'email');
    validateEmail(normalized.pecEmail, 'pecEmail');
    validateItalianMobile(normalized.mobilePhone);
    validateZipCode(normalized.zipCode);
    validateTaxCode(normalized.taxCode);
    validateVatNumber(normalized.vatNumber);
    validatePec(normalized.pecEmail);

    const updatePayload = toUpdatePayload(normalized);

    logger.info('Updating professional profile', { userId });
    const updated = await professionalProfileRepository.updateForUser(userId, updatePayload);
    if (!updated) {
      throw new ValidationError('professionalProfile.notFound', {});
    }

    return toDTO(updated);
  }
}

export const professionalProfileService = new ProfessionalProfileService();
