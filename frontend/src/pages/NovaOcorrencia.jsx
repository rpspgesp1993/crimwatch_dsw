// src/pages/NovaOcorrencia.jsx
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchBar from '../components/SearchBar';

// Corrige ícone do marcador padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

export default function NovaOcorrencia() {
  const [form, setForm] = useState({
    tipo: '',
    data: '',
    municipio: '',
    bairro: '',
    descricao: '',
    coordenadas: { lat: null, lon: null }
  });

  const mapRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lon') {
      setForm((f) => ({
        ...f,
        coordenadas: { ...f.coordenadas, [name]: parseFloat(value) }
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:4000/api/ocorrencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      alert('Ocorrência registrada com sucesso!');
      setForm({
        tipo: '',
        data: '',
        municipio: '',
        bairro: '',
        descricao: '',
        coordenadas: { lat: null, lon: null }
      });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar ocorrência');
    }
  };

  function ClickHandler() {
    useMapEvents({
      click(e) {
        setForm((f) => ({
          ...f,
          coordenadas: { lat: e.latlng.lat, lon: e.latlng.lng }
        }));
      }
    });
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>Nova Ocorrência</h2>
      <form onSubmit={handleSubmit}>
        <label>Tipo de Ocorrência:</label><br />
        <select name="tipo" value={form.tipo} onChange={handleChange} required>
          <option value="">Selecione um tipo</option>
          <option value="Roubos">Roubos</option>
          <option value="Furtos">Furtos</option>
          <option value="Estupro">Estupro</option>
          <option value="Policial morto em serviço">Policial morto em serviço</option>
        </select><br /><br />

        <label>Data:</label><br />
        <input name="data" type="date" value={form.data} onChange={handleChange} required /><br /><br />

        <label>Município:</label><br />
        <input name="municipio" value={form.municipio} onChange={handleChange} /><br /><br />

        <label>Bairro:</label><br />
        <input name="bairro" value={form.bairro} onChange={handleChange} /><br /><br />

        <label>Descrição:</label><br />
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%' }}
        /><br /><br />

        {/* Autocomplete */}
        <SearchBar
          onSelect={(lat, lon) => {
            setForm((f) => ({
              ...f,
              coordenadas: { lat, lon }
            }));
            if (mapRef.current) {
              mapRef.current.setView([lat, lon], 15);
            }
          }}
        />

        <label>Clique no mapa para escolher a localização:</label>
        <div style={{ height: 300, marginBottom: 10 }}>
          <MapContainer
            center={[-23.9608, -46.3336]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => { mapRef.current = map }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <ClickHandler />
            {form.coordenadas.lat && form.coordenadas.lon && (
              <Marker position={[form.coordenadas.lat, form.coordenadas.lon]} />
            )}
          </MapContainer>
        </div>

        <label>Latitude:</label><br />
        <input
          name="lat"
          type="number"
          value={form.coordenadas.lat || ''}
          onChange={handleChange}
          required
        /><br /><br />

        <label>Longitude:</label><br />
        <input
          name="lon"
          type="number"
          value={form.coordenadas.lon || ''}
          onChange={handleChange}
          required
        /><br /><br />

        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
