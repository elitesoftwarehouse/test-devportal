const { Company, User } = require('../models');

async function findCompanyById(id, options = {}) {
  return Company.findByPk(id, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
    ...options,
  });
}

async function updateCompanyAccreditationData(id, payload) {
  const company = await Company.findByPk(id);
  if (!company) {
    return null;
  }

  const now = new Date();

  company.legalName = payload.legalName ?? company.legalName;
  company.vatNumber = payload.vatNumber ?? company.vatNumber;
  company.taxCode = payload.taxCode ?? company.taxCode;
  company.legalAddressStreet = payload.legalAddressStreet ?? company.legalAddressStreet;
  company.legalAddressPostalCode = payload.legalAddressPostalCode ?? company.legalAddressPostalCode;
  company.legalAddressCity = payload.legalAddressCity ?? company.legalAddressCity;
  company.legalAddressProvince = payload.legalAddressProvince ?? company.legalAddressProvince;
  company.legalAddressCountry = payload.legalAddressCountry ?? company.legalAddressCountry;
  company.businessEmail = payload.businessEmail ?? company.businessEmail;
  company.businessPhone = payload.businessPhone ?? company.businessPhone;

  if (payload.accreditationStatus && payload.accreditationStatus !== company.accreditationStatus) {
    if (!company.firstAccreditationAt && payload.accreditationStatus === 'ACTIVE') {
      company.firstAccreditationAt = now;
    }
    company.accreditationStatus = payload.accreditationStatus;
    company.lastAccreditationUpdateAt = now;
  } else {
    company.lastAccreditationUpdateAt = now;
  }

  if (payload.ownerUserId !== undefined) {
    company.ownerUserId = payload.ownerUserId;
  }

  await company.save();

  return company.reload({
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
  });
}

module.exports = {
  findCompanyById,
  updateCompanyAccreditationData,
};
