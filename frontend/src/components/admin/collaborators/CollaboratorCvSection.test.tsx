import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollaboratorCvSection } from './CollaboratorCvSection';
import * as api from '../../../api/adminCollaboratorCvApi';
import { AdminCollaboratorCv } from '../../../types/adminCollaboratorCvTypes';

jest.mock('../../../hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ user: { id: 'u1', roles: ['ADMIN'], displayName: 'Admin User' } }),
}));

jest.mock('../../../api/adminCollaboratorCvApi');

const mockCvs: AdminCollaboratorCv[] = [
  {
    id: 'cv1',
    fileName: 'cv1.pdf',
    status: 'CURRENT',
    uploadedAt: new Date().toISOString(),
    uploadedBy: { id: 'u1', displayName: 'Admin User' },
    fileSizeBytes: '1024',
    mimeType: 'application/pdf',
  },
];

describe('CollaboratorCvSection', () => {
  beforeEach(() => {
    (api.fetchCollaboratorCvs as jest.Mock).mockResolvedValue(mockCvs);
  });

  it('renders list of CVs', async () => {
    render(<CollaboratorCvSection collaboratorId="c1" />);

    expect(await screen.findByText('CV collaboratore')).toBeInTheDocument();
    expect(await screen.findByText('cv1.pdf')).toBeInTheDocument();
  });

  it('opens upload modal when button is clicked', async () => {
    render(<CollaboratorCvSection collaboratorId="c1" />);

    const btn = await screen.findByText('Carica nuovo CV');
    fireEvent.click(btn);

    expect(await screen.findByText('Carica nuovo CV')).toBeInTheDocument();
  });
});
