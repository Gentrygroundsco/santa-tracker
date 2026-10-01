import React, { useState } from 'react';
import type { SantaStop } from '@/data/santaRoute2026';
import { SANTA_ROUTE_2026 } from '@/data/santaRoute2026';
import { searchNearby } from '@/lib/search';

export function SearchPanel({ onSelect }: { onSelect: (stop: SantaStop) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SantaStop[]>([]);
  const [open, setOpen] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      const found = searchNearby(value, SANTA_ROUTE_2026);
      setResults(found);
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div className="search-panel">
      <input
        type="text"
        placeholder="Search city or country..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query.length > 1 && setOpen(true)}
        className="search-input"
      />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((stop) => (
            <button
              key={stop.id}
              className="search-result-item"
              onClick={() => {
                onSelect(stop);
                setQuery('');
                setOpen(false);
              }}
            >
              <strong>{stop.city}</strong>
              <span>
                {stop.region ? `${stop.region}, ` : ''}
                {stop.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
