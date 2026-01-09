import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExternalCollaboratorInvitesSection } from './ExternalCollaboratorInvitesSection';

jest.mock('../../hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ user: { id: 'u1', role: 'EXTERNAL_OWNER' } })
}));

jest.mock('../../hooks/useCompanies', () => ({
  useCompanies: () => ({ companies: [], loading: false })
}));

jest.mock('../../api/externalInvitesApi', () => ({
  createExternalInvite: jest.fn().mockResolvedValue({}),
  fetchExternalInvites: jest.fn().mockResolvedValue([])
}));

jest.mock('../ui/Button', () => ({
  Button: (props: any) => <button {...props} />
}));

jest.mock('../ui/Input', () => ({
  Input: (props: any) => <input {...props} />
}));

jest.mock('../ui/TextArea', () => ({
  TextArea: (props: any) => <textarea {...props} />
}));

jest.mock('../ui/Select', () => ({
  Select: (props: any) => <select {...props} />
}));

jest.mock('../ui/Card', () => ({
  Card: (props: any) => <div>{props.children}</div>
}));

jest.mock('../ui/Spinner', () => ({
  Spinner: () => <span>loading</span>
}));

describe('ExternalCollaboratorInvitesSection', () => {
  it('renders form fields and validates required email', () => {
    render(<ExternalCollaboratorInvitesSection />);

    const emailInput = screen.getByLabelText(/Email collaboratore/i);
    expect(emailInput).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /Invia invito/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Email collaboratore obbligatoria/i)).toBeInTheDocument();
  });
});
