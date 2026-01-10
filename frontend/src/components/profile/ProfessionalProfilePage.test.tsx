import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfessionalProfilePage from './ProfessionalProfilePage';
import * as api from '../../api/professionalProfileApi';

jest.mock('../../api/professionalProfileApi');

const mockedApi = api as jest.Mocked<typeof api>;

describe('ProfessionalProfilePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('shows first access info when profile does not exist', async () => {
    mockedApi.getProfessionalProfile.mockResolvedValue(null);

    render(<ProfessionalProfilePage />);

    expect(await screen.findByText(/Primo accesso/i)).toBeInTheDocument();
  });

  test('validates required fields on submit', async () => {
    mockedApi.getProfessionalProfile.mockResolvedValue(null);

    render(<ProfessionalProfilePage />);

    const submit = await screen.findByRole('button', { name: /Crea profilo/i });
    fireEvent.click(submit);

    expect(await screen.findByText(/Nome obbligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/Cognome obbligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/Email non valida/i)).toBeInTheDocument();
  });

  test('calls createProfessionalProfile when saving first time', async () => {
    mockedApi.getProfessionalProfile.mockResolvedValue(null);
    mockedApi.createProfessionalProfile.mockResolvedValue({
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      fiscalCode: 'RSSMRA80A01H501U',
    } as any);

    render(<ProfessionalProfilePage />);

    await waitFor(() => screen.getByRole('button', { name: /Crea profilo/i }));

    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Mario' } });
    fireEvent.change(screen.getByLabelText(/Cognome/i), { target: { value: 'Rossi' } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'mario.rossi@example.com' } });
    fireEvent.change(screen.getByLabelText(/Codice fiscale/i), { target: { value: 'RSSMRA80A01H501U' } });

    const submit = screen.getByRole('button', { name: /Crea profilo/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(mockedApi.createProfessionalProfile).toHaveBeenCalled();
    });
  });
});
