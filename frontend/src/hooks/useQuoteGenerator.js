import { useState, useEffect } from 'react';

const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:3001/api';

const useQuoteGenerator = () => {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState('unknown');
  const [selectedType, setSelectedType] = useState('Random');
  const [activeTab, setActiveTab] = useState('generator');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data || []);
        }
      } catch (e) {
        console.warn('Failed to load history:', e);
      }
    }
    load();

    checkOllamaStatus();
  }, []);

  async function checkOllamaStatus() {
    try {
      const response = await fetch(`${API_BASE}/ollama/status`);
      const data = await response.json();
      setOllamaStatus(data.status);
    } catch (e) {
      setOllamaStatus('disconnected');
    }
  }

  async function generateQuote(seed = '', type = 'Random') {
    setIsLoading(true);
    setError(null);
    try {
      const { seed: normalizedSeed, type: normalizedType } = normalizeInput(seed, type);
      const quote = await callGenerateAPI(normalizedSeed, normalizedType);
      setCurrentQuote(quote);
      await saveHistory(quote);
    } catch (err) {
      console.error('Generate quote error:', err);
      setError(String(err.message || err));
    } finally {
      setIsLoading(false);
    }
  }

  function normalizeInput(seed = '', type = 'Random') {
    const normalizedSeed = String(seed || '').trim();
    let normalizedType = String(type || 'Random').trim();

    if (normalizedSeed.toLowerCase() === 'love' && /make/i.test(normalizedType)) {
      normalizedType = 'love';
      try {
        setSelectedType(normalizedType);
      } catch (e) {
        // ignore state update errors (very unlikely)
      }
    }

    return { seed: normalizedSeed, type: normalizedType };
  }

  async function callGenerateAPI(seed, type) {
    const res = await fetch(`${API_BASE}/quotes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, type }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.error || err.message || 'Failed to generate quote');
    }

    return res.json();
  }

  async function saveHistory(quoteObj) {
    if (!quoteObj || !quoteObj.quote) return;
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: quoteObj.quote, author: quoteObj.author, ts: Date.now() }),
      });

      if (res.ok) {
        const saved = await res.json();
        setHistory((prev) => [
          { quote: quoteObj.quote, author: quoteObj.author, ts: saved.ts, _id: saved.insertedId },
          ...prev.slice(0, 19),
        ]);
        return;
      }
    } catch (e) {
      console.warn('Failed to save history to server:', e);
    }

    setHistory((prev) => [{ ...quoteObj, timestamp: Date.now() }, ...prev.slice(0, 19)]);
  }

  function selectFromHistory(index) {
    const selected = history[index];
    if (selected) setCurrentQuote(selected);
  }

  function copyToClipboard(quote = currentQuote) {
    if (!quote) return;
    const text = `"${quote.quote}" — ${quote.author}`;
    navigator.clipboard?.writeText(text);
  }

  function clearHistory() {
    setHistory([]);
  }

  return {
    currentQuote,
    history,
    isLoading,
    ollamaStatus,
    selectedType,
    activeTab,
    error,
    setActiveTab,
    generateQuote,
    setSelectedType,
    selectFromHistory,
    copyToClipboard,
    clearHistory,
  };
};

export default useQuoteGenerator;
