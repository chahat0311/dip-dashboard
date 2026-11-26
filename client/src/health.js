// Thin helpers for the walking-skeleton health page. Kept free of React so they are easy to unit test.

export function apiBaseUrl(raw = import.meta.env.VITE_API_URL) {
  return (raw || 'http://localhost:3000').replace(/\/+$/, '');
}

export async function fetchHealth(fetchImpl = fetch, base = apiBaseUrl()) {
  const res = await fetchImpl(`${base}/health`);
  const body = await res.json().catch(() => ({}));
  return { httpStatus: res.status, ...body };
}

// Turn a health response (or a network error) into what the page shows.
export function describeHealth(result) {
  if (!result) return { tone: 'pending', label: 'Checking…' };
  if (result.error) return { tone: 'bad', label: 'API unreachable' };
  if (result.status === 'ok' && result.db === 'ok') return { tone: 'good', label: 'API and database OK' };
  return { tone: 'bad', label: 'API up, database unreachable' };
}
