const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validazioni per registrazione utente esterno
const registerExternalValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .isLength({ max: 100 }).withMessage('Il nome non può superare 100 caratteri'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .isLength({ max: 100 }).withMessage('Il cognome non può superare 100 caratteri'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Formato email non valido')
    .isLength({ max: 255 }).withMessage('L\'email non può superare 255 caratteri'),
  body('password')
    .notEmpty().withMessage('La password è obbligatoria')
    .isLength({ min: 8 }).withMessage('La password deve contenere almeno 8 caratteri'),
  body('role')
    .notEmpty().withMessage('Il ruolo è obbligatorio')
    .isIn(['EXTERNAL_OWNER', 'EXTERNAL_COLLABORATOR'])
    .withMessage('Ruolo non valido'),
];

// Punto di estensione per rate limiting / captcha
// es: const rateLimiter = require('../middleware/rateLimiter');
// router.post('/auth/register-external', rateLimiter, registerExternalValidation, authController.registerExternal);

router.post('/auth/register-external', registerExternalValidation, authController.registerExternal);

module.exports = router;
