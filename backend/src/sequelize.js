import { Sequelize } from 'sequelize';

// Integrazione semplice per i test di integrazione.
// Nella codebase reale questo file dovrebbe già esistere; qui viene incluso
// per rendere il codice eseguibile in modo autonomo nei test.

export const sequelize = new Sequelize('sqlite::memory:', {
  logging: false
});
