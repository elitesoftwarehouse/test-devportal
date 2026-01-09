import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

async function runAccreditamentoIntegrationTest() {
  const response = await fetch(`${API_BASE_URL}/api/testing/accreditamento/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Errore durante l\'esecuzione dei test');
  }

  return response.json();
}

export function AccreditamentoTestDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const data = await runAccreditamentoIntegrationTest();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Errore sconosciuto');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="accreditamento-test-dashboard">
      <h2>Diagnostica flusso primo accreditamento</h2>
      <p>
        Questa schermata consente di eseguire un test di integrazione end-to-end sul flusso di primo
        accreditamento azienda e collegamento dell\'EXTERNAL_OWNER.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleRunTests}
        disabled={isRunning}
      >
        {isRunning ? 'Esecuzione in corso...' : 'Esegui test di integrazione'}
      </button>

      {error && (
        <div className="accreditamento-test-dashboard__error">
          <strong>Errore:</strong> {error}
        </div>
      )}

      {result && (
        <div className="accreditamento-test-dashboard__result">
          <h3>Risultato</h3>
          <p>
            Stato: <strong>{result.success ? 'OK' : 'KO'}</strong>
          </p>
          {result.summary && <p>{result.summary}</p>}
          {Array.isArray(result.details) && result.details.length > 0 && (
            <ul>
              {result.details.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AccreditamentoTestDashboard;
