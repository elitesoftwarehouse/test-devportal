import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuppliersPage } from './SuppliersPage';

jest.mock('../../api/suppliersApi', () => ({
  fetchSuppliers: jest.fn().mockResolvedValue([]),
  createSupplier: jest.fn(),
  updateSupplier: jest.fn(),
  deleteSupplier: jest.fn(),
}));

describe('SuppliersPage', () => {
  it('renderizza titolo e form base', async () => {
    render(<SuppliersPage />);
    expect(screen.getByText('Fornitori')).toBeInTheDocument();
    expect(screen.getByText('Nuovo fornitore')).toBeInTheDocument();
    expect(screen.getByLabelText('Ragione sociale *')).toBeInTheDocument();
  });
});
