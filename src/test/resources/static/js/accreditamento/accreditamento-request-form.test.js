// Test Jest per la logica di validazione del form di richiesta accreditamento

/**
 * NOTA: Questo file è scritto assumendo l'esistenza di un setup Jest/JSDOM
 * lato frontend, coerente con gli altri test già presenti nel progetto.
 * Se la struttura dei test differisce, allineare posizione e configurazione
 * a quanto già esistente.
 */

import {
    validateRequired,
    validateEmail,
    validateMaxLength,
    buildValidationState
} from '../../../../main/resources/static/js/accreditamento/accreditamento-request-form.js';


describe('Validazioni form richiesta accreditamento', () => {
    test('validateRequired ritorna errore per valori vuoti o solo spazi', () => {
        expect(validateRequired('')).toBe(false);
        expect(validateRequired('   ')).toBe(false);
        expect(validateRequired(null)).toBe(false);
        expect(validateRequired(undefined)).toBe(false);
        expect(validateRequired('Mario')).toBe(true);
    });

    test('validateEmail valida correttamente formati email', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name+tag@domain.co')).toBe(true);

        expect(validateEmail('')).toBe(false);
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('foo@bar')).toBe(false);
        expect(validateEmail('foo@bar.')).toBe(false);
    });

    test('validateMaxLength rispetta limiti di lunghezza', () => {
        expect(validateMaxLength('abc', 3)).toBe(true);
        expect(validateMaxLength('abc', 5)).toBe(true);
        expect(validateMaxLength('abcd', 3)).toBe(false);
        expect(validateMaxLength('', 0)).toBe(true);
    });

    test('buildValidationState produce mappa errori coerente', () => {
        const formValues = {
            nome: '',
            cognome: 'Rossi',
            email: 'wrong',
            azienda: 'Azienda molto lunga che supera il limite'.repeat(5),
            ruolo: '',
            note: 'note ok'
        };

        const state = buildValidationState(formValues);

        expect(state.nome.valid).toBe(false);
        expect(state.nome.message).toBe('Il nome è obbligatorio');

        expect(state.cognome.valid).toBe(true);

        expect(state.email.valid).toBe(false);
        expect(state.email.message).toBe('Inserire un indirizzo email valido');

        expect(state.azienda.valid).toBe(false);
        expect(state.azienda.message).toBe('L\'azienda non può superare i 255 caratteri');

        expect(state.ruolo.valid).toBe(false);
        expect(state.ruolo.message).toBe('Il ruolo è obbligatorio');

        expect(state.note.valid).toBe(true);
    });
});
