import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompetenceProfileCard from './CompetenceProfileCard';
import * as api from '../../api/competenceProfileApi';

jest.mock('../../api/competenceProfileApi');

const mockedApi = api as jest.Mocked<typeof api>;

describe('CompetenceProfileCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carica e visualizza il profilo competenze', async () => {
    mockedApi.getCompetenceProfile.mockResolvedValue({
      role: 'Software Engineer',
      keySkills: ['React'],
      yearsOfExperience: 3,
      primaryLanguage: 'it-IT',
    });

    render(<CompetenceProfileCard />);

    expect(screen.getByText(/Caricamento profilo competenze/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('valida i campi obbligatori prima del salvataggio', async () => {
    mockedApi.getCompetenceProfile.mockResolvedValue({
      role: '',
      keySkills: [],
      yearsOfExperience: null,
      primaryLanguage: '',
    });

    render(<CompetenceProfileCard />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Ruolo/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Salva profilo competenze/i }));

    expect(await screen.findByText(/Il ruolo è obbligatorio/i)).toBeInTheDocument();
    expect(await screen.findByText(/La lingua di lavoro principale è obbligatoria/i)).toBeInTheDocument();
  });

  it('aggiunge e rimuove una skill', async () => {
    mockedApi.getCompetenceProfile.mockResolvedValue({
      role: 'Software Engineer',
      keySkills: [],
      yearsOfExperience: null,
      primaryLanguage: 'it-IT',
    });

    render(<CompetenceProfileCard />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Skills chiave/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Aggiungi una skill/i);
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi/i }));

    expect(screen.getByText('React')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Rimuovi skill React/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });
});
