import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    // Per demo: simuliamo un utente admin. In produzione, usare auth reale.
    'x-test-user-role': 'admin'
  }
});

export async function listFornitori({ soloAttivi } = {}) {
  const params = {};
  if (typeof soloAttivi === 'boolean') {
    params.soloAttivi = soloAttivi;
  }
  const res = await client.get('/fornitori-aziende', { params });
  return res.data;
}

export async function createFornitore(payload) {
  const res = await client.post('/fornitori-aziende', payload);
  return res.data;
}

export async function updateFornitore(id, payload) {
  const res = await client.put(`/fornitori-aziende/${id}`, payload);
  return res.data;
}

export async function changeStatoFornitore(id, attivo) {
  const res = await client.patch(`/fornitori-aziende/${id}/stato`, { attivo });
  return res.data;
}

export async function deleteFornitore(id) {
  await client.delete(`/fornitori-aziende/${id}`);
}
