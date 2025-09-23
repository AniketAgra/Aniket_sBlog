// Lightweight API utilities for the client

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      if (v.length) search.set(k, v.join(','));
    } else {
      search.set(k, String(v));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchJSON(path, options = {}) {
  const res = await fetch(path, { credentials: 'include', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function getProjects(params = {}) {
  const qs = buildQuery({ includeFacets: 1, ...params });
  return fetchJSON(`/api/projects${qs}`);
}
