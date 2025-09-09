import React from 'react'

export default function QuoteCard({ quote, author, source, thinking, className = '' }) {
  return (
    <div className={`quote-card ${className}`}>
      <blockquote className="quote-text">"{quote}"</blockquote>
      <div className="quote-author">
        — {author}
        {source && <span className="ml-2 text-xs text-gray-400">({source})</span>}
      </div>
      {thinking && (
        <details className="mt-3 p-2 bg-gray-50 rounded text-sm">
          <summary className="cursor-pointer text-gray-600 font-medium">AI Thinking Process</summary>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap">{thinking}</div>
        </details>
      )}
    </div>
  )
}
