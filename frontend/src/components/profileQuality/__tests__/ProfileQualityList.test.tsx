import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileQualityList from '../ProfileQualityList';
import * as api from '../../../api/profileQualityApi';

jest.mock('../../../api/profileQualityApi');

const mockFetchProfileQualityList = api.fetchProfileQualityList as jest.Mock;

const MOCK_ITEMS = [
  {
    id: 'p1',
    nome: 'Mario Rossi',
    tipo: 'PROFESSIONISTA',
    completezza: 100,
    statoQualita: 'OK',
    campiMancanti: []
  },
  {
    id: 'p2',
    nome: 'Acme S.p.A.',
    tipo: 'AZIENDA',
    completezza: 72,
    statoQualita: 'WARNING',
    campiMancanti: ['Indirizzo sede legale', 'PEC']
  },
  {
    id: 'p3',
    nome: 'Luca Bianchi',
    tipo: 'COLLABORATORE',
    completezza: 38,
    statoQualita: 'KO',
    campiMancanti: ['Codice fiscale']
  }
];

function setupMock(items = MOCK_ITEMS) {
  mockFetchProfileQualityList.mockResolvedValue({
    items,
    total: items.length
  });
}

describe('ProfileQualityList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizza la vista base con titolo, filtri e tabella', async () => {
    setupMock();

    render(<ProfileQualityList ruolo="UTENTE" />);

    expect(screen.getByTestId('profile-quality-view')).toBeInTheDocument();
    expect(screen.getByText('Qualità profili')).toBeInTheDocument();

    // Filtri presenti
    expect(screen.getByTestId('pq-filter-tipo')).toBeInTheDocument();
    expect(screen.getByTestId('pq-filter-completezza')).toBeInTheDocument();

    // Tabella caricata con righe
    await waitFor(() => {
      expect(screen.getByTestId('pq-table')).toBeInTheDocument();
      expect(screen.getByTestId('pq-row-p1')).toBeInTheDocument();
      expect(screen.getByTestId('pq-row-p2')).toBeInTheDocument();
      expect(screen.getByTestId('pq-row-p3')).toBeInTheDocument();
    });

    // Badge di completezza
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('mostra correttamente badge e icone di stato qualità', async () => {
    setupMock();

    const { container } = render(<ProfileQualityList ruolo="UTENTE" />);

    await waitFor(() => {
      expect(screen.getByTestId('pq-row-p1')).toBeInTheDocument();
    });

    const okIcons = container.querySelectorAll('.pq-status-icon--ok');
    const warnIcons = container.querySelectorAll('.pq-status-icon--warning');
    const koIcons = container.querySelectorAll('.pq-status-icon--ko');

    expect(okIcons.length).toBeGreaterThanOrEqual(1);
    expect(warnIcons.length).toBeGreaterThanOrEqual(1);
    expect(koIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('invia parametri corretti quando si usa il filtro tipo profilo', async () => {
    setupMock();

    render(<ProfileQualityList ruolo="UTENTE" />);

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(1);
    });

    const selectTipo = screen.getByTestId('pq-filter-tipo') as HTMLSelectElement;

    fireEvent.change(selectTipo, { target: { value: 'AZIENDA' } });

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(2);
    });

    const lastCallArgs = mockFetchProfileQualityList.mock.calls[1][0];

    expect(lastCallArgs.tipo).toBe('AZIENDA');
  });

  it('invia parametri corretti quando si usa il filtro livello completezza', async () => {
    setupMock();

    render(<ProfileQualityList ruolo="UTENTE" />);

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(1);
    });

    const selectComp = screen.getByTestId('pq-filter-completezza') as HTMLSelectElement;

    fireEvent.change(selectComp, { target: { value: 'ALTA' } });

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(2);
    });

    const lastCallArgs = mockFetchProfileQualityList.mock.calls[1][0];

    expect(lastCallArgs.livelloCompletezza).toBe('ALTA');
  });

  it('aggiorna ordinamento quando si cliccano le intestazioni ordinabili', async () => {
    setupMock();

    render(<ProfileQualityList ruolo="UTENTE" />);

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(1);
    });

    const sortNome = screen.getByTestId('pq-sort-nome');
    const sortCompletezza = screen.getByTestId('pq-sort-completezza');

    // Clic su completezza
    fireEvent.click(sortCompletezza);

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(2);
    });
    let args = mockFetchProfileQualityList.mock.calls[1][0];
    expect(args.orderBy).toBe('completezza');

    // Clic su nome per cambiare
    fireEvent.click(sortNome);

    await waitFor(() => {
      expect(mockFetchProfileQualityList).toHaveBeenCalledTimes(3);
    });
    args = mockFetchProfileQualityList.mock.calls[2][0];
    expect(args.orderBy).toBe('nome');
  });

  it('mostra dettagli campi mancanti per profilo incompleto e non per profilo completo', async () => {
    setupMock();

    render(<ProfileQualityList ruolo="UTENTE" />);

    await waitFor(() => {
      expect(screen.getByTestId('pq-row-p1')).toBeInTheDocument();
      expect(screen.getByTestId('pq-row-p2')).toBeInTheDocument();
    });

    // Profilo completo: nessun pulsante dettagli, solo label Profilo completo
    expect(screen.getByTestId('pq-no-missing-p1')).toHaveTextContent('Profilo completo');

    // Profilo parziale: pulsante presente
    const toggleP2 = screen.getByTestId('pq-details-toggle-p2');
    expect(toggleP2).toBeInTheDocument();
    expect(toggleP2).toHaveTextContent('Mostra dettagli');

    fireEvent.click(toggleP2);

    await waitFor(() => {
      expect(screen.getByTestId('pq-row-details-p2')).toBeInTheDocument();
      expect(screen.getByText('Indirizzo sede legale')).toBeInTheDocument();
      expect(screen.getByText('PEC')).toBeInTheDocument();
    });
  });

  it('gestisce il caso di nessun risultato mostrando il messaggio appropriato', async () => {
    setupMock([]);

    render(<ProfileQualityList ruolo="UTENTE" />);

    await waitFor(() => {
      expect(screen.getByTestId('pq-empty')).toBeInTheDocument();
      expect(
        screen.getByText('Nessun profilo trovato con i filtri selezionati.')
      ).toBeInTheDocument();
    });
  });

  it('visualizza correttamente il ruolo utente nella subtitle', async () => {
    setupMock();

    render(<ProfileQualityList ruolo="AMMINISTRATORE" />);

    await waitFor(() => {
      expect(screen.getByTestId('pq-role')).toHaveTextContent('Amministratore');
    });
  });
});
