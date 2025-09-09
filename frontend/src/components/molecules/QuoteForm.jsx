import React, { useState } from 'react'
import Button from '../atoms/Button'

// QuoteForm: seed = topic (success, love, work, friendship, ...)
//            type = style (motivational, funny, inspirational, ...)
export default function QuoteForm({ onGenerate, isLoading = false, selectedType = 'Random', onTypeChange = () => {} }) {
  const [seed, setSeed] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Pass both seed (topic) and type (style) to the generator
    onGenerate?.(seed, selectedType)
  }  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-red-400">⚙️</span>
          Quote Configuration
        </h3>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Topic (seed) selector */}
        <div className="flex-1">
          <label htmlFor="seed-select" className="block text-sm font-bold text-orange-300 mb-2 uppercase tracking-wider">
            Topic (Seed)
          </label>
          <select
            id="seed-select"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={isLoading}
            className="input-field w-full"
            aria-label="Topic (seed)"
          >
            <option value="">🎲 Any topic</option>
            <option value="Success">🏆 Success</option>
            <option value="Love">❤️ Love</option>
            <option value="Work">💼 Work</option>
            <option value="Friendship">🤝 Friendship</option>
            <option value="Life">🌟 Life</option>
            <option value="Happiness">😊 Happiness</option>
            <option value="Career">📈 Career</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">Pick what the quote should be about</p>
        </div>

        {/* Style (type) selector */}
        <div className="flex-1">
          <label htmlFor="type-select" className="block text-sm font-bold text-orange-300 mb-2 uppercase tracking-wider">
            Style (Type)
          </label>
          <select
            id="type-select"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={isLoading}
            className="input-field w-full"
            aria-label="Style (type)"
          >
            <option value="Random">🎭 Random style</option>
            <option value="Inspirational">✨ Inspirational</option>
            <option value="Motivational">💪 Motivational</option>
            <option value="Funny">😄 Funny</option>
            <option value="Philosophical">🤔 Philosophical</option>
            <option value="Sarcastic">😏 Sarcastic</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">Choose the tone or style of the quote</p>
        </div>

        <div className="flex items-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="shrink-0 h-fit"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚡</span>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🚀</span>
                Generate Quote
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
