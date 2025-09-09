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
    <div className="min-h-screen game-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Heading>Quote Generator</Heading>
          <div className="flex items-center justify-center gap-4">
            <div className="text-sm font-semibold">
              <span className="text-gray-400 uppercase tracking-wider">Ollama Status:</span>
              <span className={`ml-2 status-badge ${
                ollamaStatus === 'connected' 
                  ? 'status-connected' 
                  : ollamaStatus === 'disconnected'
                  ? 'status-disconnected'
                  : 'status-unknown'
              }`}>
                {ollamaStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}>
            Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}>
            History
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'generator' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Quote Display - Centered */}
            <div className="flex justify-center">
              <div className="w-full max-w-3xl">
                {currentQuote ? (
                  <QuoteCard 
                    quote={currentQuote.quote}
                    author={currentQuote.author}
                    source={currentQuote.source}
                    thinking={currentQuote.thinking}
                  />
                ) : (
                  <div className="card">
                    <div className="h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded mb-6 animate-pulse"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-3/4 animate-pulse"></div>
                    <div className="mt-4 text-gray-400 text-center font-medium">
                      ⚡ Ready to generate epic quotes ⚡
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-6 p-4 bg-red-900/30 border-2 border-red-500/50 text-red-300 rounded-xl backdrop-filter backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-xl">⚠️</span>
                      <strong className="font-bold uppercase tracking-wider">Error:</strong>
                    </div>
                    <div className="mt-2">{error}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Form - Centered */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <QuoteForm onGenerate={generateQuote} isLoading={isLoading} selectedType={selectedType} onTypeChange={setSelectedType} />
              </div>
            </div>

            {/* History Section - Below form */}
            {history.length > 0 && (
              <div className="flex justify-center">
                <div className="w-full max-w-3xl">
                  <HistoryList 
                    items={history.slice(0, 5)}
                    onSelect={selectFromHistory}
                    onCopy={copyToClipboard}
                    onClear={clearHistory}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
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
  )
}
