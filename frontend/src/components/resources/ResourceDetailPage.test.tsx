import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import ResourceDetailPage from './ResourceDetailPage';
import resourcesApi from '../../api/resourcesApi';

jest.mock('../../api/resourcesApi');

const mockedApi: any = resourcesApi;

function renderWithRouter(resourceId: number) {
  return render(
    <MemoryRouter initialEntries={[`/resources/${resourceId}`]}>
      <Route path="/resources/:id">
        <ResourceDetailPage />
      </Route>
    </MemoryRouter>
  );
}

describe('ResourceDetailPage', () => {
  it('mostra i dettagli della risorsa e l\'elenco CV', async () => {
    mockedApi.getResourceDetail.mockResolvedValue({
      id: 1,
      fullName: 'Mario Rossi',
      role: 'Sviluppatore',
      cvs: [
        { id: 10, fileName: 'cv-mario.pdf', mimeType: 'application/pdf', downloadUrl: '/api/resources/1/cvs/10/download' }
      ]
    });

    renderWithRouter(1);

    expect(await screen.findByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('cv-mario.pdf')).toBeInTheDocument();
    expect(screen.getByText('Download CV')).toBeInTheDocument();
  });

  it('chiama l\'API di download quando si clicca su Download CV', async () => {
    mockedApi.getResourceDetail.mockResolvedValue({
      id: 1,
      fullName: 'Mario Rossi',
      role: 'Sviluppatore',
      cvs: [
        { id: 10, fileName: 'cv-mario.pdf', mimeType: 'application/pdf', downloadUrl: '/api/resources/1/cvs/10/download' }
      ]
    });

    mockedApi.downloadResourceCv.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));

    renderWithRouter(1);

    const button = await screen.findByText('Download CV');

    fireEvent.click(button);

    expect(mockedApi.downloadResourceCv).toHaveBeenCalledWith(1, 10);
  });
});
