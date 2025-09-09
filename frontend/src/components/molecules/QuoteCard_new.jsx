import React from 'react'

export default function QuoteCard({ quote, author, source, className = '' }) {
  return (
    <div className={`quote-card ${className}`}>
      <blockquote className="quote-text">"{quote}"</blockquote>
      <div className="quote-author">
        — {author}
        {source && <span className="ml-2 text-xs text-gray-400">({source})</span>}
      </div>
    </div>
  )
}
