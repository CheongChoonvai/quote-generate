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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Topic (seed) selector */}
      <div className="w-44">
        <label htmlFor="seed-select" className="sr-only">Topic (seed)</label>
        <select
          id="seed-select"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          disabled={isLoading}
          className="input-field w-full"
          aria-label="Topic (seed)"
        >
          <option value="">Any topic</option>
          <option value="Success">Success</option>
          <option value="Love">Love</option>
          <option value="Work">Work</option>
          <option value="Friendship">Friendship</option>
          <option value="Life">Life</option>
          <option value="Happiness">Happiness</option>
          <option value="Career">Career</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Seed = topic. Pick what the quote should be about (e.g., love, work, success).</p>
      </div>

      {/* Style (type) selector */}
      <div className="w-44">
        <label htmlFor="type-select" className="sr-only">Style (type)</label>
        <select
          id="type-select"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          disabled={isLoading}
          className="input-field w-full"
          aria-label="Style (type)"
        >
          <option value="Random">Random style</option>
          <option value="Inspirational">Inspirational</option>
          <option value="Motivational">Motivational</option>
          <option value="Funny">Funny</option>
          <option value="Philosophical">Philosophical</option>
          <option value="Sarcastic">Sarcastic</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Type = style. Choose the tone or style of the quote (motivational, funny, etc.).</p>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="shrink-0"
      >
        {isLoading ? 'Generating...' : 'Generate Quote'}
      </Button>
    </form>
  )
}
