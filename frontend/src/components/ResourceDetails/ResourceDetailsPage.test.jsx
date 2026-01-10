import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceDetailsPage from './ResourceDetailsPage';

jest.mock('../../api/resourcesApi', () => ({
  fetchResourceDetails: jest.fn().mockResolvedValue({
    resource: {
      id: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      fullName: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      role: 'Developer',
      seniority: 'Senior',
      availability: 'Subito'
    },
    skillsProfile: {
      mainSkills: 'Node.js, React',
      skillTags: ['Node.js', 'React'],
      languages: [{ code: 'it', level: 'Madrelingua' }]
    },
    cvs: [
      {
        id: 10,
        title: 'CV IT',
        language: 'it',
        fileSizeBytes: 1024,
        isPrimary: true,
        downloadUrl: '/api/resources/1/cvs/10/download'
      }
    ]
  })
}));

describe('ResourceDetailsPage', () => {
  test('mostra i dettagli della risorsa e la tabella CV', async () => {
    render(<ResourceDetailsPage resourceId={1} />);

    expect(await screen.findByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('CV IT')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });
});
