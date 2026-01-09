import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanyCollaboratorsTab } from './CompanyCollaboratorsTab';

jest.mock('../../api/companyCollaboratorsApi', () => ({
  companyCollaboratorsApi: {
    list: jest.fn().mockResolvedValue({ content: [], page: 0, size: 10, total: 0 }),
  },
}));

describe('CompanyCollaboratorsTab', () => {
  it('renderizza il titolo e il form di creazione', async () => {
    render(<CompanyCollaboratorsTab companyId="company-1" />);

    expect(screen.getByText("Collaboratori associati all'azienda")).toBeInTheDocument();
    expect(screen.getByText('Aggiungi collaboratore')).toBeInTheDocument();
  });
});
