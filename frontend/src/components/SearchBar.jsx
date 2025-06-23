import React, { useState } from 'react';
import axios from 'axios';

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
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: value + ', Baixada Santista, São Paulo, Brasil',
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
      });

      setResults(res.data);
    } catch (err) {
      console.error('Erro na busca:', err);
      setResults([]);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setResults([]);
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    onSelect(lat, lon);
  };

  return (
    <div className="search-bar" style={{ position: 'absolute', top: 9, left: 60, zIndex: 1000 }}>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Buscar bairro ou cidade..."
        style={{ width: '370px', padding: '8px' }}
      />
      {results.length > 0 && (
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          maxHeight: '150px',
          overflowY: 'auto',
          width: '250px'
        }}>
          {results.map((r) => (
            <li key={r.place_id} onClick={() => handleSelect(r)} style={{ cursor: 'pointer', padding: '5px' }}>
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
