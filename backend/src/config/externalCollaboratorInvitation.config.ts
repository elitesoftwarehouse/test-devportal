import { z } from 'zod';

export interface ExternalCollaboratorInvitationConfig {
  tokenTtlHours: number;
  portalBaseUrl: string;
  mailFrom: string;
  localeDefault: string;
}

const ExternalCollaboratorInvitationEnvSchema = z.object({
  EXTERNAL_COLLABORATOR_INVITATION_TOKEN_TTL_HOURS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 72))
    .refine((val) => Number.isFinite(val) && val > 0, {
      message: 'EXTERNAL_COLLABORATOR_INVITATION_TOKEN_TTL_HOURS must be a positive integer'
    }),
  EXTERNAL_COLLABORATOR_PORTAL_BASE_URL: z
    .string()
    .url('EXTERNAL_COLLABORATOR_PORTAL_BASE_URL must be a valid URL'),
  EXTERNAL_COLLABORATOR_MAIL_FROM: z
    .string()
    .email('EXTERNAL_COLLABORATOR_MAIL_FROM must be a valid email address')
    .optional()
    .default('no-reply@elite-portal.local'),
  EXTERNAL_COLLABORATOR_INVITATION_LOCALE_DEFAULT: z
    .string()
    .optional()
    .default('it')
});

export const loadExternalCollaboratorInvitationConfig = (
  env: NodeJS.ProcessEnv
): ExternalCollaboratorInvitationConfig => {
  const parsed = ExternalCollaboratorInvitationEnvSchema.parse(env);

  return {
    tokenTtlHours: parsed.EXTERNAL_COLLABORATOR_INVITATION_TOKEN_TTL_HOURS,
    portalBaseUrl: parsed.EXTERNAL_COLLABORATOR_PORTAL_BASE_URL.replace(/\/$/, ''),
    mailFrom: parsed.EXTERNAL_COLLABORATOR_MAIL_FROM,
    localeDefault: parsed.EXTERNAL_COLLABORATOR_INVITATION_LOCALE_DEFAULT
  };
};
