const { Op } = require('sequelize');
const { CompanyCollaborator, Company, User } = require('../models');

/**
 * Repository per la gestione dei collaboratori associati alle aziende.
 * Fornisce metodi semplici e lineari, in linea con il resto del progetto.
 */
class CompanyCollaboratorRepository {
  async findByCompany(companyId) {
    return CompanyCollaborator.findAll({
      where: { companyId },
      include: [
        { model: Company, as: 'company' },
        { model: User, as: 'user' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findByCompanyAndUser(companyId, userId) {
    return CompanyCollaborator.findOne({
      where: { companyId, userId },
    });
  }

  async createAssociation({ companyId, userId, role, status, userAuditId }) {
    return CompanyCollaborator.create({
      companyId,
      userId,
      role,
      status,
      createdBy: userAuditId || null,
      updatedBy: userAuditId || null,
    });
  }

  async updateAssociation(id, { role, status, userAuditId }) {
    const association = await CompanyCollaborator.findByPk(id);
    if (!association) {
      return null;
    }

    if (typeof role === 'string' && role.trim() !== '') {
      association.role = role.trim();
    }
    if (typeof status === 'string') {
      association.status = status;
    }
    association.updatedBy = userAuditId || association.updatedBy;

    await association.save();
    return association;
  }

  async deleteAssociation(id) {
    return CompanyCollaborator.destroy({ where: { id } });
  }

  async existsDuplicate({ companyId, userId, role, excludeId }) {
    const where = {
      companyId,
      userId,
      role,
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await CompanyCollaborator.count({ where });
    return count > 0;
  }
}

module.exports = new CompanyCollaboratorRepository();
