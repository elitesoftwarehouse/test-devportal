import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileSearchUnified } from './ProfileSearchUnified';

jest.mock('../api/profileApi', () => ({
  fetchUnifiedProfiles: jest.fn().mockResolvedValue({
    data: [],
    total: 0,
    limit: 50,
    offset: 0,
    meta: {
      profileTypeOptions: [],
      qualityLevels: [],
    },
  }),
}));

describe('ProfileSearchUnified', () => {
  it('renderizza intestazione e filtri base', () => {
    render(<ProfileSearchUnified />);
    expect(screen.getByText('Consultazione profili')).toBeInTheDocument();
    expect(screen.getByLabelText('Ricerca')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo profilo')).toBeInTheDocument();
  });
});
