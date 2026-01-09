import React from 'react';
import { InternalCollaboratorsSection } from '../components/collaborators/InternalCollaboratorsSection';
import { ExternalCollaboratorInvitesSection } from '../components/collaborators/ExternalCollaboratorInvitesSection';
import { PageLayout } from '../components/layout/PageLayout';

export const CollaboratorsPage: React.FC = () => {
  return (
    <PageLayout title="Gestione collaboratori">
      <InternalCollaboratorsSection />
      <ExternalCollaboratorInvitesSection />
    </PageLayout>
  );
};
