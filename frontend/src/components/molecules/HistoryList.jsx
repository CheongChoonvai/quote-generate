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
      <div className="bg-brand-blue-gray-dark text-center p-6 rounded-md">
        <div className="text-4xl mb-4">🎯</div>
        <div className="text-brand-medium-gray font-medium">
          No history yet. Generated quotes will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider">History</h3>
        <button
          className="text-xs text-brand-aqua hover:text-brand-light-blue-gray font-bold uppercase tracking-wider border border-brand-medium-gray px-2 py-1 rounded-none hover:bg-brand-blue-gray-dark transition-all"
          onClick={handleClear}
          aria-label="Clear history"
        >
          Clear
        </button>
      </div>

      <div className="history-container bg-brand-dark-navy border-2 border-brand-medium-gray max-h-96 overflow-auto">
        <ul>
          {items.map((it, idx) => (
            <li key={it._id || idx} className="history-item p-4 hover:bg-brand-blue-gray-dark border-l-4 border-transparent hover:border-brand-gold transition-all">
              <div className="flex-1">
                <button onClick={() => onSelect(idx)} className="text-left w-full group">
                  <p className="text-sm leading-snug break-words text-brand-light-blue-gray group-hover:text-brand-gold transition-colors">
                    "{it.quote}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-brand-gold font-semibold">— {it.author}</p>
                    <p className="text-xs text-brand-medium-gray">{timeAgo(it.ts || it.createdAt)}</p>
                  </div>
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 ml-3">
                <button
                  onClick={() => onCopy(it)}
                  className="text-xs px-3 py-1 rounded-none bg-brand-blue-gray-dark border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-dark-navy transition-all font-bold uppercase tracking-wider"
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
