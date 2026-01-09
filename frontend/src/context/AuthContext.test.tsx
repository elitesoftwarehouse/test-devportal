import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from './AuthContext';
import httpClient from '../api/httpClient';

jest.mock('../api/httpClient');

const mockedHttp = httpClient as jest.Mocked<typeof httpClient>;

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inizializza con utente nullo se /auth/me fallisce', async () => {
    mockedHttp.get.mockRejectedValueOnce(new Error('no session'));

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.initialized).toBe(true);
  });

  it('imposta utente dopo login', async () => {
    mockedHttp.get.mockRejectedValueOnce(new Error('no session'));
    const fakeUser = { id: 1, email: 'test@example.com', roles: ['EMPLOYEE'] };

    mockedHttp.post.mockResolvedValueOnce({ data: { user: fakeUser } } as any);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(fakeUser);
  });

  it('hasRole ritorna true per ruolo corretto', async () => {
    const fakeUser = { id: 1, email: 'test@example.com', roles: ['SYS_ADMIN'] };

    mockedHttp.get.mockResolvedValueOnce({ data: { user: fakeUser } } as any);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.hasRole('SYS_ADMIN')).toBe(true);
    expect(result.current.hasRole('IT_OPERATOR')).toBe(false);
  });
});
