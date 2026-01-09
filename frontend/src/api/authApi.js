const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

export async function registerExternalUser(payload) {
  const res = await fetch(`${BASE_URL}/auth/external/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'REGISTRATION_FAILED');
  }
  return data;
}

export async function activateExternalUser(token) {
  const res = await fetch(`${BASE_URL}/auth/external/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ACTIVATION_FAILED');
  }
  return data;
}
