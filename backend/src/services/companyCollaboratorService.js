const companyCollaboratorRepository = require('../repositories/companyCollaboratorRepository');

// Valori raccomandati per ruoli e stati, usati anche per validazione lato backend.
const ALLOWED_ROLES = ['ADMIN', 'REFERENTE', 'COLLABORATORE'];
const ALLOWED_STATUS = ['ATTIVO', 'INATTIVO'];

class CompanyCollaboratorService {
  getAllowedRoles() {
    return ALLOWED_ROLES;
  }

  getAllowedStatus() {
    return ALLOWED_STATUS;
  }

  async listByCompany(companyId) {
    return companyCollaboratorRepository.findByCompany(companyId);
  }

  async addCollaboratorToCompany({ companyId, userId, role, status, userAuditId }) {
    this.validateRole(role);
    this.validateStatus(status);

    const exists = await companyCollaboratorRepository.existsDuplicate({
      companyId,
      userId,
      role,
    });

    if (exists) {
      const error = new Error('Collaboratore già associato alla stessa azienda con lo stesso ruolo');
      error.code = 'DUPLICATE_COLLABORATOR_ROLE';
      error.statusCode = 400;
      throw error;
    }

    return companyCollaboratorRepository.createAssociation({
      companyId,
      userId,
      role,
      status,
      userAuditId,
    });
  }

  async updateCollaboratorAssociation(id, { role, status, userAuditId }) {
    if (role) {
      this.validateRole(role);
    }
    if (status) {
      this.validateStatus(status);
    }

    if (role) {
      const association = await companyCollaboratorRepository.findByCompanyAndUser;
    }

    const updated = await companyCollaboratorRepository.updateAssociation(id, {
      role,
      status,
      userAuditId,
    });

    if (!updated) {
      const error = new Error('Associazione collaboratore-azienda non trovata');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  async removeCollaboratorAssociation(id) {
    const deleted = await companyCollaboratorRepository.deleteAssociation(id);
    if (!deleted) {
      const error = new Error('Associazione collaboratore-azienda non trovata');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }

  validateRole(role) {
    if (!role || typeof role !== 'string') {
      const error = new Error('Ruolo collaboratore non valido');
      error.statusCode = 400;
      throw error;
    }
    const normalized = role.toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      const error = new Error(`Ruolo non supportato. Valori ammessi: ${ALLOWED_ROLES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }

  validateStatus(status) {
    if (!status || typeof status !== 'string') {
      const error = new Error('Stato collaboratore non valido');
      error.statusCode = 400;
      throw error;
    }
    const normalized = status.toUpperCase();
    if (!ALLOWED_STATUS.includes(normalized)) {
      const error = new Error(`Stato non supportato. Valori ammessi: ${ALLOWED_STATUS.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }
}

module.exports = new CompanyCollaboratorService();
