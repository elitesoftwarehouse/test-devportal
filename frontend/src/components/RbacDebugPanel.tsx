import React, { useState } from 'react';
import { RbacApi, RbacTestResponse } from '../api/rbacClient';
import './RbacDebugPanel.css';

interface ResultState {
  endpoint: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  response?: RbacTestResponse;
}

const initialState: ResultState = {
  endpoint: '',
  status: 'idle',
};

const RbacDebugPanel: React.FC = () => {
  const [result, setResult] = useState<ResultState>(initialState);

  const handleCall = async (
    label: string,
    caller: () => Promise<RbacTestResponse>,
  ) => {
    setResult({ endpoint: label, status: 'loading' });
    const data = await caller();
    setResult({
      endpoint: label,
      status: data.success ? 'success' : 'error',
      response: data,
    });
  };

  const renderResponse = () => {
    if (result.status === 'idle') {
      return <div className="rbac-debug-response-empty">Nessuna chiamata effettuata.</div>;
    }

    if (!result.response) {
      return <div className="rbac-debug-response-error">Nessuna risposta dal server.</div>;
    }

    const { success, error, data } = result.response;

    return (
      <div
        className={`rbac-debug-response rbac-debug-response-${
          success ? 'success' : 'error'
        }`}
      >
        <div className="rbac-debug-response-title">
          Risultato chiamata: {result.endpoint}
        </div>
        <div className="rbac-debug-response-body">
          {error && <div className="rbac-debug-line">Errore: {error}</div>}
          {data?.message && (
            <div className="rbac-debug-line">Messaggio: {data.message}</div>
          )}
          {data?.user && (
            <>
              <div className="rbac-debug-line">Utente: {data.user.email}</div>
              <div className="rbac-debug-line">
                Ruoli: {data.user.roles && data.user.roles.join(', ')}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rbac-debug-panel">
      <h2 className="rbac-debug-title">Debug autorizzazioni RBAC</h2>
      <p className="rbac-debug-description">
        Questa schermata consente di verificare rapidamente il comportamento del
        middleware RBAC sugli endpoint di esempio. Effettua il login con un
        utente specifico e prova i pulsanti per vedere se ottieni 200, 401 o 403.
      </p>
      <div className="rbac-debug-buttons">
        <button
          className="rbac-debug-button"
          onClick={() =>
            handleCall('SYS_ADMIN only', RbacApi.testSysAdminOnly)
          }
        >
          Test SYS_ADMIN only
        </button>
        <button
          className="rbac-debug-button"
          onClick={() =>
            handleCall('IT_OPERATOR only', RbacApi.testItOperatorOnly)
          }
        >
          Test IT_OPERATOR only
        </button>
        <button
          className="rbac-debug-button"
          onClick={() =>
            handleCall('External only', RbacApi.testExternalOnly)
          }
        >
          Test utente esterno
        </button>
        <button
          className="rbac-debug-button"
          onClick={() =>
            handleCall('Authenticated generic', RbacApi.testAuthenticatedGeneric)
          }
        >
          Test autenticato generico
        </button>
      </div>
      <div className="rbac-debug-response-container">{renderResponse()}</div>
    </div>
  );
};

export default RbacDebugPanel;
