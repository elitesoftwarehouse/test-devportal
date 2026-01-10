import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceSearchPage from './ResourceSearchPage';
import * as resourcesApi from '../../api/resourcesApi';

jest.mock('../../api/resourcesApi');

const mockedSearchResources = resourcesApi.searchResources as jest.MockedFunction<
  typeof resourcesApi.searchResources
>;

describe('ResourceSearchPage', () => {
  beforeEach(() => {
    mockedSearchResources.mockReset();
  });

  it('mostra risultati dopo la ricerca', async () => {
    mockedSearchResources.mockResolvedValue({
      items: [
        {
          id: 1,
          firstName: 'Mario',
          lastName: 'Rossi',
          fullName: 'Mario Rossi',
          role: { id: 1, name: 'Developer' },
          skills: [
            { id: 1, code: 'JS', name: 'JavaScript' },
          ],
        },
      ],
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    });

    render(<ResourceSearchPage />);

    // Avvio iniziale della ricerca nella useEffect
    await waitFor(() => {
      expect(mockedSearchResources).toHaveBeenCalled();
    });

    const searchButton = screen.getByRole('button', { name: /cerca/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });
  });
});
