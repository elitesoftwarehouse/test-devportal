import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyCollaboratorsModelDoc from './CompanyCollaboratorsModelDoc';

jest.mock('../../api/companyCollaboratorsApi', () => ({
  fetchCollaboratorMetadata: jest.fn().mockResolvedValue({
    roles: ['ADMIN', 'REFERENTE'],
    status: ['ATTIVO', 'INATTIVO'],
  }),
}));

describe('CompanyCollaboratorsModelDoc', () => {
  it('mostra intestazioni di base', async () => {
    render(<CompanyCollaboratorsModelDoc />);

    expect(
      await screen.findByText('Modello dati collaboratori azienda')
    ).toBeInTheDocument();
    expect(screen.getByText('Struttura tabella di join')).toBeInTheDocument();
  });
});
