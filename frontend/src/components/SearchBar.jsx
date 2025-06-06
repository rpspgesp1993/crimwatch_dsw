import React, { useState } from 'react';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Erro na busca:', err);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Buscar endereço, bairro ou cidade..."
        style={{ width: '100%', padding: '8px', fontSize: '1rem' }}
      />
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 4 }}>
        {results.map((r) => (
          <li
            key={r.place_id}
            onClick={() => {
              onSelect(Number(r.lat), Number(r.lon));
              setQuery('');
              setResults([]);
            }}
            style={{ cursor: 'pointer', padding: '6px', borderBottom: '1px solid #ccc' }}
          >
            {r.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
