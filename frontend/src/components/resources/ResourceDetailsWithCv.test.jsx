import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceDetailsWithCv from './ResourceDetailsWithCv';

jest.mock('../../api/resourcesApi', () => ({
  getResourceDetails: jest.fn()
}));

describe('ResourceDetailsWithCv', () => {
  test('mostra messaggio se nessuna risorsa è selezionata', () => {
    render(<ResourceDetailsWithCv />);
    expect(screen.getByText(/Seleziona una risorsa/i)).toBeInTheDocument();
  });
});
