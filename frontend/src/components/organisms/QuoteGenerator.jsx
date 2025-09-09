import React, { useState, useEffect } from 'react'
import Heading from '../atoms/Heading'
import QuoteCard from '../molecules/QuoteCard'
import QuoteForm from '../molecules/QuoteForm'
import HistoryList from '../molecules/HistoryList'

// Read the API base from Vite env (VITE_API_BASE). Provide a safe fallback for dev.
const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:3001/api'

export default function QuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState('unknown')
  const [selectedType, setSelectedType] = useState('Random')
  const [activeTab, setActiveTab] = useState('generator')
  const [error, setError] = useState(null)

  // Load history from backend
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

    // Check Ollama status
    checkOllamaStatus()
  }, [])

  async function checkOllamaStatus() {
    try {
      const response = await fetch(`${API_BASE}/ollama/status`)
      const data = await response.json()
      setOllamaStatus(data.status)
    } catch (e) {
      setOllamaStatus('disconnected')
    }
  }

  // Generate a quote: thin top-level function delegating steps to helpers
  async function generateQuote(seed = '', type = 'Random') {
    setIsLoading(true)
    setError(null)
    try {
      const { seed: normalizedSeed, type: normalizedType } = normalizeInput(seed, type)
      const quote = await callGenerateAPI(normalizedSeed, normalizedType)
      setCurrentQuote(quote)
      await saveHistory(quote)
    } catch (err) {
      console.error('Generate quote error:', err)
      setError(String(err.message || err))
    } finally {
      setIsLoading(false)
    }
  }

  // Helpers: keep each step small and explicit
  function normalizeInput(seed = '', type = 'Random') {
    const normalizedSeed = String(seed || '').trim()
    let normalizedType = String(type || 'Random').trim()

    // Special-case: if user asked "love" as a seed and selected a "make" action,
    // force the type to "love" and update UI selection.
    if (normalizedSeed.toLowerCase() === 'love' && /make/i.test(normalizedType)) {
      normalizedType = 'love'
      try {
        setSelectedType(normalizedType)
      } catch (e) {
        // ignore state update errors (very unlikely)
      }
    }

    return { seed: normalizedSeed, type: normalizedType }
  }

  async function callGenerateAPI(seed, type) {
    const res = await fetch(`${API_BASE}/quotes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, type })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(err.error || err.message || 'Failed to generate quote')
    }

    return res.json()
  }

  async function saveHistory(quoteObj) {
    if (!quoteObj || !quoteObj.quote) return
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: quoteObj.quote, author: quoteObj.author, ts: Date.now() })
      })

      if (res.ok) {
        const saved = await res.json()
        setHistory(prev => [{ quote: quoteObj.quote, author: quoteObj.author, ts: saved.ts, _id: saved.insertedId }, ...prev.slice(0, 19)])
        return
      }
    } catch (e) {
      console.warn('Failed to save history to server:', e)
    }

    // Fallback: update local history when server save fails
    setHistory(prev => [{ ...quoteObj, timestamp: Date.now() }, ...prev.slice(0, 19)])
  }

  function selectFromHistory(index) {
    const selected = history[index]
    if (selected) setCurrentQuote(selected)
  }

  function copyToClipboard(quote = currentQuote) {
    if (!quote) return
    const text = `"${quote.quote}" — ${quote.author}`
    navigator.clipboard?.writeText(text)
  }

  function clearHistory() {
    setHistory([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Heading>Quote Generator</Heading>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Ollama: 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                ollamaStatus === 'connected' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {ollamaStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-md font-medium ${activeTab === 'generator' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-700'}`}>
            Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md font-medium ${activeTab === 'history' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-700'}`}>
            History
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'generator' && (
            <>
              {/* Quote Display */}
              <div className="lg:col-span-2 space-y-6">
                {currentQuote ? (
                  <QuoteCard 
                    quote={currentQuote.quote}
                    author={currentQuote.author}
                    source={currentQuote.source}
                    thinking={currentQuote.thinking}
                  />
                ) : (
                  <div className="card animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded">
                    Error: {error}
                  </div>
                )}

                {/* Quote Form */}
                <QuoteForm onGenerate={generateQuote} isLoading={isLoading} selectedType={selectedType} onTypeChange={setSelectedType} />

              </div>

              {/* History Sidebar (kept as a small preview column while in generator) */}
              <div className="lg:col-span-1">
                {history.length > 0 ? (
                  <HistoryList 
                    items={history}
                    onSelect={selectFromHistory}
                    onCopy={copyToClipboard}
                    onClear={clearHistory}
                  />
                ) : null}
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="lg:col-span-3">
              <HistoryList 
                items={history}
                onSelect={selectFromHistory}
                onCopy={copyToClipboard}
                onClear={clearHistory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
