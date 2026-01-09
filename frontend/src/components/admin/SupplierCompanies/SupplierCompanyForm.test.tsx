import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupplierCompanyForm } from './SupplierCompanyForm';

describe('SupplierCompanyForm', () => {
  it('shows validation errors for required fields', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onCancel = jest.fn();

    render(<SupplierCompanyForm mode="create" onSubmit={onSubmit} onCancel={onCancel} />);

    const submitButton = screen.getByRole('button', { name: /Crea azienda/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('La ragione sociale è obbligatoria')).toBeInTheDocument();
      expect(screen.getByText('La partita IVA è obbligatoria')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
