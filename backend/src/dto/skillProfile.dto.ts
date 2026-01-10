import { body, query } from 'express-validator';

export interface SkillProfileResponseDto {
  id: number;
  userId: number;
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  primaryLanguage: string | null;
  summary: string | null;
  metadata: Record<string, any> | null;
}

export interface SkillProfileUpsertDto {
  role?: string | null;
  keySkills?: string[];
  yearsOfExperience?: number | null;
  primaryLanguage?: string | null;
  summary?: string | null;
  metadata?: Record<string, any> | null;
}

export const validateSkillProfileUpsert = () => [
  body('role')
    .optional({ nullable: true })
    .isString().withMessage('role deve essere una stringa')
    .isLength({ max: 100 }).withMessage('role max 100 caratteri'),
  body('keySkills')
    .optional()
    .isArray({ max: 50 }).withMessage('keySkills deve essere un array (max 50 elementi)'),
  body('keySkills.*')
    .optional()
    .isString().withMessage('ogni skill deve essere una stringa')
    .isLength({ max: 100 }).withMessage('ogni skill max 100 caratteri'),
  body('yearsOfExperience')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 60 }).withMessage('yearsOfExperience deve essere un intero tra 0 e 60'),
  body('primaryLanguage')
    .optional({ nullable: true })
    .isString().withMessage('primaryLanguage deve essere una stringa')
    .matches(/^[a-zA-Z]{2}(-[a-zA-Z]{2})?$/)
    .withMessage('primaryLanguage deve essere in formato ISO 639-1 (es. it, en, en-US)')
    .isLength({ max: 5 }).withMessage('primaryLanguage max 5 caratteri'),
  body('summary')
    .optional({ nullable: true })
    .isString().withMessage('summary deve essere una stringa')
    .isLength({ max: 1000 }).withMessage('summary max 1000 caratteri'),
  body('metadata')
    .optional({ nullable: true })
    .isObject().withMessage('metadata deve essere un oggetto'),
];

export const validateSkillProfileSearch = () => [
  query('role')
    .optional()
    .isString().withMessage('role deve essere una stringa')
    .isLength({ max: 100 }).withMessage('role max 100 caratteri'),
  query('skill')
    .optional()
    .isString().withMessage('skill deve essere una stringa')
    .isLength({ max: 100 }).withMessage('skill max 100 caratteri'),
  query('minYears')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('minYears deve essere un intero tra 0 e 60'),
  query('language')
    .optional()
    .isString().withMessage('language deve essere una stringa')
    .matches(/^[a-zA-Z]{2}(-[a-zA-Z]{2})?$/)
    .withMessage('language deve essere in formato ISO 639-1 (es. it, en, en-US)')
    .isLength({ max: 5 }).withMessage('language max 5 caratteri'),
];

export function mapSkillProfileToDto(profile: any): SkillProfileResponseDto {
  return {
    id: profile.id,
    userId: profile.userId,
    role: profile.role,
    keySkills: Array.isArray(profile.keySkills) ? profile.keySkills : [],
    yearsOfExperience: profile.yearsOfExperience,
    primaryLanguage: profile.primaryLanguage,
    summary: profile.summary,
    metadata: profile.metadata ?? null,
  };
}
