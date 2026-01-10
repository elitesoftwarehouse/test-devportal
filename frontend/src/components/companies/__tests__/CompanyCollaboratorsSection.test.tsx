import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanyCollaboratorsSection } from '../CompanyCollaboratorsSection';

jest.mock('../../../api/companyCollaboratorsApi', () => ({
  companyCollaboratorsApi: {
    list: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../../../api/collaboratorsApi', () => ({
  collaboratorsApi: {
    listOptions: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

jest.mock('../../../hooks/useConfirmDialog', () => ({
  useConfirmDialog: () => ({
    confirm: jest.fn().mockResolvedValue(true)
  })
}));

jest.mock('../../ui/Button', () => ({
  Button: (props: any) => <button {...props}>{props.children}</button>
}));

jest.mock('../../ui/Table', () => ({
  Table: (props: any) => (
    <table data-testid="mock-table">
      <tbody>{props.data.length === 0 && <tr><td>{props.emptyMessage}</td></tr>}</tbody>
    </table>
  )
}));

jest.mock('../../ui/Badge', () => ({
  Badge: (props: any) => <span>{props.children}</span>
}));

jest.mock('../../ui/Modal', () => ({
  Modal: (props: any) => (
    <div data-testid="mock-modal">
      <h1>{props.title}</h1>
      {props.children}
      <button onClick={props.onClose}>Chiudi</button>
    </div>
  )
}));

jest.mock('../../ui/Icons', () => ({
  IconEdit: () => <span />, 
  IconPlus: () => <span />, 
  IconToggleOn: () => <span />, 
  IconToggleOff: () => <span />
}));

describe('CompanyCollaboratorsSection', () => {
  it('renders section with title and empty table', async () => {
    render(<CompanyCollaboratorsSection companyId={1} />);

    expect(screen.getByText('Collaboratori')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-table')).toBeInTheDocument();
    expect(await screen.findByText("Nessun collaboratore associato all'azienda.")).toBeInTheDocument();
  });
});
