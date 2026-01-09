import express from 'express';
import bcrypt from 'bcrypt';
import { ExternalUserRegistrationService } from '../services/ExternalUserRegistrationService.js';
import { EmailService } from '../services/EmailService.js';
import { EmailProvider } from '../providers/EmailProvider.js';
import { UserRepository } from '../repositories/UserRepository.js';

export const authRouter = express.Router();

const userRepository = new UserRepository();
const emailProvider = new EmailProvider();
const emailService = new EmailService(emailProvider, {});
const registrationService = new ExternalUserRegistrationService(userRepository, emailService, {
  activationBaseUrl: process.env.ACTIVATION_BASE_URL || 'http://localhost:3000/activate-external',
  activationTokenTtlMs: 1000 * 60 * 60 * 24
});

// Endpoint registrazione utente esterno
authRouter.post('/external/register', async (req, res) => {
  try {
    const user = await registrationService.registerExternalUser(req.body);
    res.status(201).json({
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role
    });
  } catch (err) {
    switch (err.message) {
      case 'EMAIL_REQUIRED':
      case 'PASSWORD_REQUIRED':
      case 'FIRST_NAME_REQUIRED':
      case 'LAST_NAME_REQUIRED':
      case 'PASSWORD_TOO_SHORT':
      case 'INVALID_ROLE':
        return res.status(400).json({ error: err.message });
      case 'EMAIL_ALREADY_USED':
        return res.status(409).json({ error: err.message });
      default:
        // eslint-disable-next-line no-console
        console.error('Registration error', err);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  }
});

// Endpoint attivazione account tramite token
authRouter.post('/external/activate', async (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ error: 'TOKEN_REQUIRED' });
  }

  try {
    const result = await userRepository.activateUserByToken(token);
    if (result.error === 'TOKEN_NOT_FOUND') {
      return res.status(404).json({ error: 'TOKEN_NOT_FOUND' });
    }
    if (result.error === 'TOKEN_ALREADY_USED') {
      return res.status(410).json({ error: 'TOKEN_ALREADY_USED' });
    }
    if (result.error === 'TOKEN_EXPIRED') {
      return res.status(410).json({ error: 'TOKEN_EXPIRED' });
    }

    return res.status(200).json({
      id: result.user.id,
      email: result.user.email,
      status: result.user.status
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Activation error', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// Endpoint di login semplificato usato nei test per verificare che un PENDING_ACTIVATION non possa autenticarsi
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'CREDENTIALS_REQUIRED' });
  }

  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'USER_NOT_ACTIVE' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    // Per semplicità, ritorniamo solo info base, senza JWT
    return res.status(200).json({ id: user.id, email: user.email, status: user.status });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login error', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});
