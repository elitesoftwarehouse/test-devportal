import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import ResourceDetailPage from './ResourceDetailPage';
import * as resourcesApi from '../api/resourcesApi';

jest.mock('../api/resourcesApi');

const mockedFetchResourceDetail = resourcesApi.fetchResourceDetail as jest.Mock;
const mockedDownloadResourceCv = resourcesApi.downloadResourceCv as jest.Mock;

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Route path="/risorse/:id">
        <ResourceDetailPage />
      </Route>
    </MemoryRouter>
  );
}

describe('ResourceDetailPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('mostra i dati della risorsa e i CV', async () => {
    mockedFetchResourceDetail.mockResolvedValueOnce({
      id: 1,
      fullName: 'Mario Rossi',
      role: 'Developer',
      seniority: 'Senior',
      company: 'Elite',
      status: 'Attivo',
      skills: [],
      cvs: [
        {
          id: 10,
          title: 'CV Mario Rossi',
          fileName: 'mario_rossi_cv.pdf',
          language: 'IT',
          updatedAt: new Date('2023-01-01').toISOString(),
          format: 'PDF',
          isPrimary: true
        }
      ]
    });

    renderWithRoute('/risorse/1');

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });

    expect(screen.getByText('CV Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('Principale')).toBeInTheDocument();
  });

  test('mostra messaggio di errore se caricamento fallisce', async () => {
    mockedFetchResourceDetail.mockRejectedValueOnce(new Error('network'));

    renderWithRoute('/risorse/2');

    await waitFor(() => {
      expect(
        screen.getByText('Impossibile recuperare i dati della risorsa')
      ).toBeInTheDocument();
    });
  });

  test('invoca downloadResourceCv quando si clicca Download', async () => {
    mockedFetchResourceDetail.mockResolvedValueOnce({
      id: 1,
      fullName: 'Mario Rossi',
      role: 'Developer',
      seniority: 'Senior',
      company: 'Elite',
      status: 'Attivo',
      skills: [],
      cvs: [
        {
          id: 10,
          title: 'CV Mario Rossi',
          fileName: 'mario_rossi_cv.pdf',
          language: 'IT',
          updatedAt: new Date('2023-01-01').toISOString(),
          format: 'PDF',
          isPrimary: true
        }
      ]
    });
    mockedDownloadResourceCv.mockResolvedValueOnce(undefined);

    renderWithRoute('/risorse/1');

    await waitFor(() => {
      expect(screen.getByText('CV Mario Rossi')).toBeInTheDocument();
    });

    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockedDownloadResourceCv).toHaveBeenCalledWith(1, 10);
    });
  });
});
