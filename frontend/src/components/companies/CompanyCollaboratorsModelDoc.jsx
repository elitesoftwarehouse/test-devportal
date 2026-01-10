import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchCollaboratorMetadata } from '../../api/companyCollaboratorsApi';
import './CompanyCollaboratorsModelDoc.css';

/**
 * Componente informativo che documenta il modello dati
 * dei collaboratori associati alle aziende (ruoli, stati, vincoli).
 * Utile per amministratori e power user in Elite Portal.
 */
const CompanyCollaboratorsModelDoc = ({ className }) => {
  const [metadata, setMetadata] = useState({ roles: [], status: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCollaboratorMetadata();
        if (isMounted) {
          setMetadata(data);
        }
      } catch (e) {
        if (isMounted) {
          setError('Impossibile caricare i metadati dei collaboratori.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={`company-collaborators-model-doc ${className || ''}`}>
      <h2>Modello dati collaboratori azienda</h2>
      <p>
        Questo modulo descrive come Elite Portal gestisce i collaboratori associati alle aziende.
        Ogni riga rappresenta un collegamento tra un&apos;azienda e un utente/collaboratore,
        con ruolo e stato specifici.
      </p>

      {loading && <p className="ccmd-status">Caricamento metadati in corso...</p>}
      {error && <p className="ccmd-error">{error}</p>}

      <section>
        <h3>Struttura tabella di join</h3>
        <table className="ccmd-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Tipo</th>
              <th>Descrizione</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>id</td>
              <td>BIGINT (PK)</td>
              <td>Identificativo univoco dell&apos;associazione.</td>
            </tr>
            <tr>
              <td>company_id</td>
              <td>BIGINT (FK)</td>
              <td>Riferimento all&apos;azienda (Company) a cui è associato il collaboratore.</td>
            </tr>
            <tr>
              <td>user_id</td>
              <td>BIGINT (FK)</td>
              <td>Riferimento all&apos;utente/collaboratore (User) associato all&apos;azienda.</td>
            </tr>
            <tr>
              <td>role</td>
              <td>STRING(50)</td>
              <td>
                Ruolo del collaboratore rispetto all&apos;azienda. Validato applicativamente.
              </td>
            </tr>
            <tr>
              <td>status</td>
              <td>ENUM</td>
              <td>Stato dell&apos;associazione (ATTIVO/INATTIVO).</td>
            </tr>
            <tr>
              <td>created_at / updated_at</td>
              <td>DATETIME</td>
              <td>Timestamp di creazione e ultima modifica.</td>
            </tr>
            <tr>
              <td>created_by / updated_by</td>
              <td>BIGINT</td>
              <td>Utente che ha creato/modificato l&apos;associazione (auditing).</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>Valori di ruolo consentiti</h3>
        {metadata.roles && metadata.roles.length > 0 ? (
          <ul>
            {metadata.roles.map((role) => (
              <li key={role}>
                <code>{role}</code>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>Nessun ruolo configurato lato backend.</p>
        )}
      </section>

      <section>
        <h3>Valori di stato consentiti</h3>
        {metadata.status && metadata.status.length > 0 ? (
          <ul>
            {metadata.status.map((st) => (
              <li key={st}>
                <code>{st}</code>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>Nessuno stato configurato lato backend.</p>
        )}
      </section>

      <section>
        <h3>Vincoli di unicità</h3>
        <p>
          È applicato un vincolo di unicità logica sulla combinazione
          <code> (company_id, user_id, role) </code>:
        </p>
        <ul>
          <li>
            lo stesso collaboratore non può essere associato più volte alla stessa azienda con lo stesso ruolo;
          </li>
          <li>
            è possibile associare lo stesso collaboratore alla stessa azienda con ruoli diversi;
          </li>
          <li>
            i controlli sono applicati sia a livello di database (indice UNIQUE) sia lato backend.
          </li>
        </ul>
      </section>
    </div>
  );
};

CompanyCollaboratorsModelDoc.propTypes = {
  className: PropTypes.string,
};

CompanyCollaboratorsModelDoc.defaultProps = {
  className: '',
};

export default CompanyCollaboratorsModelDoc;
