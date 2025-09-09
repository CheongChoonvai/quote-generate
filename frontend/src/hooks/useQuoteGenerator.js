import { useState, useEffect } from 'react';
import api from '../api';

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
  const data = await api.getHistory();
  setHistory(data || []);
      } catch (e) {
        console.warn('Failed to load history:', e);
      }
    }
    load();

    checkOllamaStatus();
  }, []);

  async function checkOllamaStatus() {
    try {
  const data = await api.checkOllamaStatus();
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
  const quote = await api.generate(normalizedSeed, normalizedType);
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

  // generation handled by api.generate

  async function saveHistory(quoteObj) {
    if (!quoteObj || !quoteObj.quote) return;
    try {
      const saved = await api.saveHistory(quoteObj);

      if (saved) {
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
