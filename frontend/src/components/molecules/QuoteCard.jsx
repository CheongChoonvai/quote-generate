import React from 'react'

export default function QuoteCard({ quote, author, source, thinking, className = '' }) {
  return (
    <div className={`quote-card ${className}`}>
      <blockquote className="quote-text">"{quote}"</blockquote>
      <div className="quote-author">
        — {author}
        {source && <span className="ml-2 text-xs text-gray-400 opacity-75">({source})</span>}
      </div>
      {thinking && (
        <details className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600 text-sm backdrop-filter backdrop-blur-sm">
          <summary className="cursor-pointer text-orange-300 font-bold uppercase tracking-wider hover:text-orange-200 transition-colors">
            🧠 AI Thinking Process
          </summary>
          <div className="mt-3 text-gray-300 whitespace-pre-wrap leading-relaxed border-l-2 border-orange-500 pl-3">
            {thinking}
          </div>
        </details>
      )}
    </div>
  )
}
