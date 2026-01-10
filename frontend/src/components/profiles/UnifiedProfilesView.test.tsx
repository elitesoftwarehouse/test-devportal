import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedProfilesView from './UnifiedProfilesView';
import * as api from '../../api/profileUnifiedApi';

const mockData: api.UnifiedProfile[] = [
  {
    id: '1',
    type: 'PROFESSIONISTA',
    displayName: 'Mario Rossi',
    roleLabel: null,
    mainContact: { email: 'mario@example.com', phone: '123' },
    active: true,
    quality: { score: 90, level: 'HIGH', missingFields: [] },
    permissions: { canViewBilling: true },
    billing: { vatNumber: 'IT123', iban: 'IT60X' },
  },
];

jest.spyOn(api, 'fetchUnifiedProfiles').mockImplementation(async () => ({
  data: mockData,
  meta: { total: mockData.length },
}));

describe('UnifiedProfilesView', () => {
  it('mostra i profili e i campi chiave', async () => {
    render(<UnifiedProfilesView currentUserRole="ADMIN" />);

    expect(screen.getByText('Caricamento profili in corso...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });

    expect(screen.getByText('Professionista')).toBeInTheDocument();
    expect(screen.getByText('mario@example.com')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('permette di espandere i campi mancanti', async () => {
    const customMock: api.UnifiedProfile[] = [
      {
        ...mockData[0],
        id: '2',
        quality: { score: 40, level: 'LOW', missingFields: ['IBAN', 'telefono'] },
      },
    ];

    (api.fetchUnifiedProfiles as jest.Mock).mockResolvedValueOnce({
      data: customMock,
      meta: { total: customMock.length },
    });

    render(<UnifiedProfilesView currentUserRole="USER" />);

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    });

    const btn = screen.getByRole('button', { name: /Mostra campi mancanti/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText('Campi chiave mancanti:')).toBeInTheDocument();
      expect(screen.getByText('IBAN')).toBeInTheDocument();
      expect(screen.getByText('telefono')).toBeInTheDocument();
    });
  });
});
