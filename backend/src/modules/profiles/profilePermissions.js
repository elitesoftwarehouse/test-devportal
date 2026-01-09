/*
 * Modulo di gestione permessi per la consultazione dei profili.
 * Implementa differenze tra utente standard e amministratore e filtri sui campi sensibili.
 */

/**
 * Applica i permessi al payload del profilo, rimuovendo campi sensibili
 * per utenti non amministratori.
 *
 * @param {Object} profile - Oggetto profilo di dominio
 * @param {{ role: 'ADMIN'|'USER', id?: string }} currentUser
 * @returns {Object} profilo filtrato
 */
export function applyProfilePermissions(profile, currentUser) {
  if (!profile) {
    return profile;
  }

  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  // Copia superficiale per evitare mutazioni dell'istanza ORM
  const filtered = { ...profile };

  // Esempio di campi sensibili condivisi
  const sensitiveFields = ['taxCode', 'salary', 'internalNotes'];

  if (!isAdmin) {
    for (const field of sensitiveFields) {
      if (field in filtered) {
        delete filtered[field];
      }
    }
  }

  return filtered;
}

/**
 * Verifica se l'utente ha diritto a consultare il profilo.
 *
 * @param {Object} profile - Oggetto profilo di dominio
 * @param {{ role: 'ADMIN'|'USER', id?: string, companyId?: string }} currentUser
 * @returns {boolean}
 */
export function canViewProfile(profile, currentUser) {
  if (!currentUser) {
    return false;
  }
  if (currentUser.role === 'ADMIN') {
    return true;
  }

  // Logica base per utenti standard: possono vedere solo alcuni profili
  // Esempio:
  // - possono vedere il proprio profilo professionista/collaboratore
  // - possono vedere profili di collaboratori della stessa azienda
  if (profile.type === 'PROFESSIONISTA' || profile.type === 'COLLABORATORE') {
    if (String(profile.userId) === String(currentUser.id)) {
      return true;
    }
    if (profile.companyId && currentUser.companyId && String(profile.companyId) === String(currentUser.companyId)) {
      return true;
    }
    return false;
  }

  if (profile.type === 'AZIENDA') {
    // Utente standard può vedere solo la propria azienda
    if (String(profile.id) === String(currentUser.companyId)) {
      return true;
    }
    return false;
  }

  return false;
}
