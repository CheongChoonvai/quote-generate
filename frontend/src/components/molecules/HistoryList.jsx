import React from 'react'

function timeAgo(ts) {
  if (!ts) return ''
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export default function HistoryList({ items = [], onSelect, onCopy, onClear }) {
  async function handleClear() {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok && typeof onClear === 'function') onClear();
    } catch (e) {
      console.warn('Failed to clear history on server:', e);
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4">
        No history yet. Generated quotes will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">History</h3>
        <button className="text-xs text-red-500 hover:underline" onClick={handleClear} aria-label="Clear history">Clear</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-md divide-y max-h-72 overflow-auto">
        <ul>
          {items.map((it, idx) => (
            <li key={it._id || idx} className="p-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <button onClick={() => onSelect(idx)} className="text-left w-full">
                  <p className="text-sm leading-snug break-words">“{it.quote}”</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 mt-1">— {it.author}</p>
                    <p className="text-xs text-gray-300 mt-1">{timeAgo(it.ts || it.createdAt)}</p>
                  </div>
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 ml-3">
                <button onClick={() => onCopy(it)} className="text-xs px-2 py-1 rounded bg-gray-50 border text-gray-600 hover:bg-gray-100">Copy</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
