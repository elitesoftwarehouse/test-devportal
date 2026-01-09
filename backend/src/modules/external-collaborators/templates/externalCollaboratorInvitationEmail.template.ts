export interface ExternalCollaboratorInvitationEmailContext {
  recipientEmail: string;
  externalOwnerName: string;
  externalOwnerCompanyName: string;
  activationLink: string;
  expiresAt: Date;
  supportEmail?: string;
  locale?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const formatDateIt = (date: Date): string => {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const renderExternalCollaboratorInvitationEmail = (
  ctx: ExternalCollaboratorInvitationEmailContext
): RenderedEmail => {
  const locale = ctx.locale || 'it';

  // Per ora solo italiano, struttura predisposta per eventuale i18n
  if (locale !== 'it') {
    // fallback a italiano fino a futura estensione
  }

  const expiresAtFormatted = formatDateIt(ctx.expiresAt);

  const subject = `Invito a collaborare su Elite Portal da ${ctx.externalOwnerCompanyName}`;

  const text = [
    `Gentile collaboratore,`,
    '',
    `${ctx.externalOwnerName} di ${ctx.externalOwnerCompanyName} ti ha invitato come collaboratore esterno (EXTERNAL_COLLABORATOR) su Elite Portal.`,
    '',
    `Per attivare il tuo accesso, clicca sul seguente link:`,
    ctx.activationLink,
    '',
    `L'invito scadrà il: ${expiresAtFormatted}.`,
    '',
    `Se non ti aspettavi questa email, puoi ignorarla in sicurezza.`,
    '',
    ctx.supportEmail
      ? `Per supporto o chiarimenti puoi contattarci all'indirizzo: ${ctx.supportEmail}.`
      : 'Per supporto o chiarimenti contatta il referente aziendale che ti ha invitato.',
    '',
    'Cordiali saluti,',
    'Il team Elite Portal'
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p>Gentile collaboratore,</p>
    <p>
      <strong>${ctx.externalOwnerName}</strong> di
      <strong>${ctx.externalOwnerCompanyName}</strong>
      ti ha invitato come collaboratore esterno (EXTERNAL_COLLABORATOR) su Elite Portal.
    </p>
    <p>
      Per attivare il tuo accesso, clicca sul seguente pulsante o copia il link nel browser:
    </p>
    <p>
      <a
        href="${ctx.activationLink}"
        style="display: inline-block; padding: 10px 18px; background-color: #0052cc; color: #ffffff; text-decoration: none; border-radius: 4px;"
      >
        Attiva il tuo accesso
      </a>
    </p>
    <p style="word-break: break-all;">
      Link di attivazione: <br />
      <a href="${ctx.activationLink}">${ctx.activationLink}</a>
    </p>
    <p>
      L'invito scadrà il: <strong>${expiresAtFormatted}</strong>.
    </p>
    <p>
      Se non ti aspettavi questa email, puoi ignorarla in sicurezza.
    </p>
    <p>
      ${
        ctx.supportEmail
          ? `Per supporto o chiarimenti puoi contattarci all'indirizzo: <a href="mailto:${ctx.supportEmail}">${ctx.supportEmail}</a>.`
          : 'Per supporto o chiarimenti contatta il referente aziendale che ti ha invitato.'
      }
    </p>
    <p>Cordiali saluti,<br />Il team Elite Portal</p>
  </body>
</html>`;

  return { subject, html, text };
};
