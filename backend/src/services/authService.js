const crypto = require('crypto');
const { sequelize } = require('../db');
const authConfig = require('../config/authConfig');
const { getModels } = require('../models');

/**
 * Service di autenticazione/registrazione.
 * Esteso per supportare registrazione utenti esterni con token di attivazione.
 */

const ALLOWED_EXTERNAL_ROLES = ['EXTERNAL_OWNER', 'EXTERNAL_COLLABORATOR'];

function generateActivationToken() {
  const bytes = crypto.randomBytes(authConfig.activationToken.lengthBytes);
  return bytes.toString('hex');
}

function getActivationExpiration() {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + authConfig.activationToken.expiresInMinutes);
  return expires;
}

async function registerExternalUser({ firstName, lastName, email, password, role }) {
  const { User } = getModels();

  if (!ALLOWED_EXTERNAL_ROLES.includes(role)) {
    const error = new Error('Ruolo non valido. Sono consentiti solo ruoli esterni.');
    error.code = 'INVALID_ROLE';
    error.status = 400;
    throw error;
  }

  const normalizedEmail = (email || '').trim().toLowerCase();

  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    const error = new Error('Esiste già un utente registrato con questa email.');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.status = 409;
    throw error;
  }

  const activationToken = generateActivationToken();
  const activationTokenExpiration = getActivationExpiration();

  return sequelize.transaction(async (t) => {
    const user = await User.create(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        passwordHash: password, // hash gestito dall'hook del modello
        role,
        status: 'PENDING_ACTIVATION',
        isActive: false,
        activationToken,
        activationTokenExpiration,
      },
      { transaction: t }
    );

    // Punto di estensione: invio email con activationToken
    // es: emailService.sendActivationEmail(user, activationToken);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  });
}

module.exports = {
  registerExternalUser,
};
