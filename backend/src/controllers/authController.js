const { validationResult } = require('express-validator');
const authService = require('../services/authService');

/**
 * Controller autenticazione.
 * Esteso con endpoint registrazione utente esterno.
 */

async function registerExternal(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dati non validi',
        errors: errors.array().map((e) => ({ field: e.param, message: e.msg })),
      });
    }

    const { firstName, lastName, email, password, role } = req.body;

    const result = await authService.registerExternalUser({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'Registrazione effettuata. Controlla la tua email per attivare l\'account.',
      data: {
        id: result.id,
        email: result.email,
        role: result.role,
        status: result.status,
      },
    });
  } catch (err) {
    if (err.code === 'EMAIL_ALREADY_EXISTS') {
      return res.status(err.status || 409).json({
        success: false,
        message: err.message,
        code: err.code,
      });
    }
    if (err.code === 'INVALID_ROLE') {
      return res.status(err.status || 400).json({
        success: false,
        message: err.message,
        code: err.code,
      });
    }
    return next(err);
  }
}

module.exports = {
  registerExternal,
};
