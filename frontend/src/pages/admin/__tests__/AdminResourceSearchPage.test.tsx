import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminResourceSearchPage } from '../AdminResourceSearchPage';

jest.mock('../../../api/admin/resourcesSearchApi', () => ({
  searchAdminResources: jest.fn().mockResolvedValue({
    items: [
      { id: '1', fullName: 'Mario Rossi', roleName: 'Developer', keySkills: ['Java'] },
    ],
    page: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
  }),
}));

jest.mock('../../../api/admin/rolesApi', () => ({
  fetchAdminRoles: jest.fn().mockResolvedValue([
    { id: 'role-1', name: 'Developer' },
  ]),
}));

jest.mock('../../../api/admin/skillsApi', () => ({
  fetchAdminSkills: jest.fn().mockResolvedValue([
    { id: 'skill-1', name: 'Java' },
  ]),
}));

describe('AdminResourceSearchPage', () => {
  it('renders filters and results table', async () => {
    render(<AdminResourceSearchPage />);

    expect(
      screen.getByRole('heading', { name: /ricerca risorse/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/cerca per nome o cognome/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });
  });

  it('applies filters on button click', async () => {
    render(<AdminResourceSearchPage />);

    const input = screen.getByPlaceholderText(/cerca per nome o cognome/i);
    fireEvent.change(input, { target: { value: 'Mario' } });

    const button = screen.getByRole('button', { name: /applica filtri/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });
  });
});
