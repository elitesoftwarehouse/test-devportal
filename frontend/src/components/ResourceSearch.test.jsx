import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceSearch from './ResourceSearch';

describe('ResourceSearch component', () => {
  it('renderizza i controlli di filtro base', () => {
    render(<ResourceSearch />);

    expect(screen.getByText('Ricerca risorse')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome/Cognome')).toBeInTheDocument();
    expect(screen.getByText('Ruoli principali')).toBeInTheDocument();
    expect(screen.getByText('Skills chiave')).toBeInTheDocument();
    expect(screen.getByText('Comportamento skills')).toBeInTheDocument();
  });
});
