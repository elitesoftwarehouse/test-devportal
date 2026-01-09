import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';
import { AuthProvider } from '../../context/AuthContext';
import httpClient from '../../api/httpClient';

jest.mock('../../api/httpClient');

const mockedHttp = httpClient as jest.Mocked<typeof httpClient>;

const renderWithProviders = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mostra errore se i campi sono vuoti', async () => {
    renderWithProviders();

    const button = screen.getByRole('button', { name: /accedi/i });
    fireEvent.click(button);

    expect(await screen.findByText(/obbligatorie/i)).toBeInTheDocument();
  });

  it('chiama API di login con valori corretti', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: { user: { id: 1, email: 'user@test.it', roles: [] } } } as any);

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.it' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /accedi/i }));

    await waitFor(() => {
      expect(mockedHttp.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@test.it',
        password: 'password'
      });
    });
  });
});
