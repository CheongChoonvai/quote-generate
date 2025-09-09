const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:3001/api';

async function handleJsonResponse(res) {
  const text = await res.text().catch(() => '');
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const err = data || { message: res.statusText || 'Request failed' };
    throw err;
  }
  return data;
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  return handleJsonResponse(res).catch(() => []);
}

export async function checkOllamaStatus() {
  const res = await fetch(`${API_BASE}/ollama/status`);
  return handleJsonResponse(res);
}

export async function generate(seed = '', type = 'Random') {
  const res = await fetch(`${API_BASE}/quotes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, type }),
  });

  return handleJsonResponse(res);
}

export async function saveHistory(quoteObj) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote: quoteObj.quote, author: quoteObj.author, ts: Date.now() }),
  });

  return handleJsonResponse(res);
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  return handleJsonResponse(res).catch(() => ({ ok: false }));
}

export default {
  getHistory,
  checkOllamaStatus,
  generate,
  saveHistory,
  clearHistory,
};
