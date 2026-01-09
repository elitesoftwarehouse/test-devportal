import React, { useCallback, useState } from 'react';

export type RbacRole =
  | 'EXTERNAL_OWNER'
  | 'EXTERNAL_COLLABORATOR'
  | 'IT_OPERATOR'
  | 'SYS_ADMIN';

interface LoginResponse {
  id: string;
  email: string;
  role: RbacRole;
}

interface ProtectedResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    role: RbacRole;
  };
}

const roles: RbacRole[] = [
  'EXTERNAL_OWNER',
  'EXTERNAL_COLLABORATOR',
  'IT_OPERATOR',
  'SYS_ADMIN',
];

const DEFAULT_TEST_PASSWORD = 'P@ssw0rd!test';

const AuthRbacDiagnosticsPanel: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);
  const [status, setStatus] = useState<string>('');
  const [protectedResult, setProtectedResult] = useState<ProtectedResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('');
      setProtectedResult(null);
      setLoading(true);
      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          setCurrentUser(null);
          setStatus('Login fallito: credenziali non valide o utente disattivato');
          return;
        }

        const data: LoginResponse = await res.json();
        setCurrentUser(data);
        setStatus(`Login eseguito come ${data.email} (${data.role})`);
      } catch (error) {
        setCurrentUser(null);
        setStatus('Errore di rete durante il login');
      } finally {
        setLoading(false);
      }
    },
    [email, password]
  );

  const handleLogout = useCallback(async () => {
    setStatus('');
    setProtectedResult(null);
    setLoading(true);
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setCurrentUser(null);
      setStatus('Logout eseguito');
    } catch (error) {
      setStatus('Errore di rete durante il logout');
    } finally {
      setLoading(false);
    }
  }, []);

  const callProtected = useCallback(async () => {
    setProtectedResult(null);
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/protected/rbac-demo', {
        method: 'GET',
        credentials: 'include',
      });
      const data: ProtectedResponse = await res.json();
      setProtectedResult(data);
      if (res.status === 200) {
        setStatus('Accesso all\'endpoint protetto riuscito (200)');
      } else if (res.status === 401) {
        setStatus('Accesso negato (401) - autenticazione richiesta');
      } else if (res.status === 403) {
        setStatus('Accesso negato (403) - ruolo insufficiente');
      } else {
        setStatus(`Risposta inattesa dall\'endpoint protetto: ${res.status}`);
      }
    } catch (error) {
      setStatus('Errore di rete chiamando endpoint protetto');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrefill = useCallback((role: RbacRole) => {
    const localPart = role.toLowerCase();
    setEmail(`${localPart}@example.test`);
    setPassword(DEFAULT_TEST_PASSWORD);
    setStatus(
      `Credenziali precompilate per ruolo ${role}. Verifica che esista un utente di test corrispondente nel backend.`
    );
  }, []);

  return (
    <div className="auth-rbac-panel">
      <h2>Diagnostica autenticazione e RBAC</h2>
      <p>
        Questo pannello consente di verificare manualmente il funzionamento di
        login, logout e accesso a un endpoint protetto che richiede ruoli
        specifici.
      </p>

      <form onSubmit={handleLogin} className="auth-rbac-form">
        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="actions">
          <button type="submit" disabled={loading}>
            Login
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
          <button
            type="button"
            onClick={callProtected}
            disabled={loading}
          >
            Test endpoint protetto
          </button>
        </div>
      </form>

      <div className="role-prefill">
        <span>Precompila credenziali per ruolo:</span>
        <div className="role-buttons">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handlePrefill(role)}
              disabled={loading}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {status && <div className="status-message">{status}</div>}

      {currentUser && (
        <div className="current-user">
          <h3>Utente corrente</h3>
          <dl>
            <dt>Email</dt>
            <dd>{currentUser.email}</dd>
            <dt>Ruolo</dt>
            <dd>{currentUser.role}</dd>
          </dl>
        </div>
      )}

      {protectedResult && (
        <div className="protected-result">
          <h3>Risultato endpoint protetto</h3>
          <pre>{JSON.stringify(protectedResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthRbacDiagnosticsPanel;
