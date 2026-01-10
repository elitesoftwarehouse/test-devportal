import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import CompetenceProfileTestPage from '../CompetenceProfileTestPage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CompetenceProfileTestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockLoadProfile() {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        role: 'Software Engineer',
        keySkills: ['Java'],
        yearsOfExperience: 3,
        workingLanguage: 'IT'
      }
    } as any);
  }

  it('carica e mostra il profilo iniziale', async () => {
    mockLoadProfile();
    render(<CompetenceProfileTestPage />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('competence-profile-form')).toBeInTheDocument();
    });

    expect(screen.getByTestId('role-input')).toHaveValue('Software Engineer');
    expect(screen.getByTestId('language-select')).toHaveValue('IT');
  });

  it('valida i campi richiesti prima del salvataggio', async () => {
    mockLoadProfile();
    render(<CompetenceProfileTestPage />);

    await waitFor(() => {
      expect(screen.getByTestId('competence-profile-form')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('role-input'), { target: { value: '' } });
    fireEvent.change(screen.getByTestId('years-input'), { target: { value: '-2' } });
    fireEvent.change(screen.getByTestId('language-select'), { target: { value: '' } });

    fireEvent.click(screen.getByTestId('save-button'));

    expect(await screen.findByTestId('role-error')).toHaveTextContent('Il ruolo è obbligatorio.');
    expect(screen.getByTestId('years-error')).toHaveTextContent('Gli anni di esperienza non possono essere negativi.');
    expect(screen.getByTestId('language-error')).toHaveTextContent('La lingua di lavoro è obbligatoria.');
  });

  it('mostra messaggio di successo dopo salvataggio riuscito', async () => {
    mockLoadProfile();
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        role: 'Senior Dev',
        keySkills: ['Java', 'Spring'],
        yearsOfExperience: 6,
        workingLanguage: 'EN'
      }
    } as any);

    render(<CompetenceProfileTestPage />);

    await waitFor(() => {
      expect(screen.getByTestId('competence-profile-form')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('role-input'), { target: { value: 'Senior Dev' } });
    fireEvent.change(screen.getByTestId('language-select'), { target: { value: 'EN' } });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });

    expect(screen.getByTestId('success-message')).toHaveTextContent('Profilo competenze aggiornato con successo.');
  });

  it('visualizza errori backend di validazione', async () => {
    mockLoadProfile();
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          errors: [
            { field: 'role', message: 'Ruolo obbligatorio dal backend.' },
            { field: 'workingLanguage', message: 'Lingua di lavoro mancante dal backend.' }
          ]
        }
      }
    });

    render(<CompetenceProfileTestPage />);

    await waitFor(() => {
      expect(screen.getByTestId('competence-profile-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('backend-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('role-error')).toHaveTextContent('Ruolo obbligatorio dal backend.');
    expect(screen.getByTestId('language-error')).toHaveTextContent('Lingua di lavoro mancante dal backend.');
  });
});
