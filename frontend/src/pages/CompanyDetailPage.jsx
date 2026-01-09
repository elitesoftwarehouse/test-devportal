import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CompanyCollaboratorsTab from '../components/companies/CompanyCollaboratorsTab';

export const CompanyDetailPage = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState('collaborators');

  return (
    <div className="company-detail-page">
      <h1>Dettaglio azienda</h1>
      <div className="company-tabs">
        <button
          type="button"
          className={activeTab === 'collaborators' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('collaborators')}
        >
          Collaboratori
        </button>
        {/* Altre tab esistenti andrebbero mantenute nello stesso pattern */}
      </div>

      <div className="company-tab-content">
        {activeTab === 'collaborators' && <CompanyCollaboratorsTab companyId={companyId} />}
      </div>
    </div>
  );
};

CompanyDetailPage.propTypes = {
  companyId: PropTypes.string.isRequired,
};

export default CompanyDetailPage;
