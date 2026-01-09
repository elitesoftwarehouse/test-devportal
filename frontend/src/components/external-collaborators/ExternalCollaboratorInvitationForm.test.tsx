import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExternalCollaboratorInvitationForm } from './ExternalCollaboratorInvitationForm';

jest.mock('../../api/externalCollaboratorsApi', () => ({
  inviteExternalCollaborator: jest.fn().mockResolvedValue({
    invitationId: 'inv-1',
    invitedEmail: 'test@example.com',
    expiresAt: new Date().toISOString()
  })
}));

describe('ExternalCollaboratorInvitationForm', () => {
  it('invio invito con email valida mostra messaggio di successo', async () => {
    render(
      <ExternalCollaboratorInvitationForm
        externalOwnerId="owner-1"
        externalOwnerName="Mario Rossi"
        externalOwnerCompanyName="ACME S.p.A."
      />
    );

    const emailInput = screen.getByLabelText('Email collaboratore');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('Invia invito');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invito inviato a/)).toBeInTheDocument();
    });
  });
});
