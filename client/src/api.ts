const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function wsUrl(token: string): string {
  const base = API_BASE_URL || window.location.origin;
  const protocol = base.startsWith('https') ? 'wss' : 'ws';
  const host = base.replace(/^https?:\/\//, '');
  return `${protocol}://${host}/api/ws?token=${encodeURIComponent(token)}`;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function catchFish() {
  const res = await fetch(apiUrl('/api/fish/catch'), {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to catch fish');
  return res.json();
}

export async function getInventory() {
  const res = await fetch(apiUrl('/api/fish/inventory'), {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load inventory');
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(apiUrl('/api/fish/leaderboard'), {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load leaderboard');
  return res.json();
}

export async function getRecentCatches() {
  const res = await fetch(apiUrl('/api/fish/recent'), {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load recent catches');
  return res.json();
}
