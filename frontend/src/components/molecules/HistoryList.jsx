import React from 'react';

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
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
      <div className="card text-center">
        <div className="text-4xl mb-4">🎯</div>
        <div className="text-gray-400 font-medium">
          No history yet. Generated quotes will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-yellow uppercase tracking-wider">History</h3>
        <button
          className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider border border-red-500/50 px-2 py-1 rounded-none hover:bg-red-500/10 transition-all"
          onClick={handleClear}
          aria-label="Clear history"
        >
          Clear
        </button>
      </div>

      <div className="history-container">
        <ul>
          {items.map((it, idx) => (
            <li key={it._id || idx} className="history-item">
              <div className="flex-1">
                <button onClick={() => onSelect(idx)} className="text-left w-full group">
                  <p className="text-sm leading-snug break-words text-white group-hover:text-brand-yellow transition-colors">
                    "{it.quote}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-brand-yellow font-semibold">— {it.author}</p>
                    <p className="text-xs text-gray-400">{timeAgo(it.ts || it.createdAt)}</p>
                  </div>
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 ml-3">
                <button
                  onClick={() => onCopy(it)}
                  className="text-xs px-3 py-1 rounded-none bg-gray-800 border border-brand-yellow/50 text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark transition-all font-bold uppercase tracking-wider"
                >
                  Copy
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
