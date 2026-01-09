import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { activateAccount, ActivationResponse } from "../api/authApi";
import "../styles/AccountActivationPage.css";

interface RouteParams {
  token: string;
}

const AccountActivationPage: React.FC = () => {
  const { token } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<ActivationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const doActivation = async () => {
      if (!token) {
        setError("Token di attivazione mancante.");
        setLoading(false);
        return;
      }
      try {
        const response = await activateAccount(token);
        setResult(response);
      } catch (err: any) {
        if (err.response && err.response.data) {
          setResult(err.response.data as ActivationResponse);
        } else {
          setError("Si è verificato un errore imprevisto durante l'attivazione.");
        }
      } finally {
        setLoading(false);
      }
    };

    doActivation();
  }, [token]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="activation-page-container">
      <div className="activation-card">
        {loading && <p className="activation-message">Attivazione in corso...</p>}

        {!loading && error && (
          <>
            <h1 className="activation-title activation-title-error">Attivazione non riuscita</h1>
            <p className="activation-message">{error}</p>
          </>
        )}

        {!loading && !error && result && (
          <>
            <h1
              className={
                result.success
                  ? "activation-title activation-title-success"
                  : "activation-title activation-title-error"
              }
            >
              {result.success ? "Account attivato" : "Attivazione non riuscita"}
            </h1>
            <p className="activation-message">{result.message}</p>
            <button className="activation-button" onClick={handleGoToLogin}>
              Vai al login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountActivationPage;
