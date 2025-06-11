// src/pages/NovaOcorrencia.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Corrige ícone do marcador padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const tiposDeCrime = ['Roubos', 'Furtos', 'Estupro', 'Policial morto em serviço'];
const municipios = ['Santos', 'São Vicente', 'Praia Grande', 'Guarujá'];

const bairrosPorMunicipio = {
  'Santos': ['Centro', 'Gonzaga', 'Boqueirão', 'Aparecida'],
  'São Vicente': ['Itararé', 'Catiapoã'],
  'Praia Grande': ['Canto do Forte', 'Boqueirão'],
  'Guarujá': ['Enseada', 'Astúrias']
};

const coordenadasPorMunicipio = {
  'Santos': [-23.9608, -46.3336],
  'São Vicente': [-23.9631, -46.3919],
  'Praia Grande': [-24.0058, -46.4028],
  'Guarujá': [-23.9938, -46.2560]
};

export default function NovaOcorrencia() {
  const [form, setForm] = useState({
    tipo: '',
    data: '',
    municipio: '',
    bairro: '',
    descricao: '',
    coordenadas: { lat: '', lon: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lon') {
      setForm((f) => ({
        ...f,
        coordenadas: { ...f.coordenadas, [name]: value }
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  useEffect(() => {
    if (form.municipio && coordenadasPorMunicipio[form.municipio] && mapRef.current) {
      const [lat, lon] = coordenadasPorMunicipio[form.municipio];
      mapRef.current.setView([lat, lon], 14);
    }
  }, [form.municipio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tipo, data, municipio, bairro, descricao, coordenadas } = form;

    if (!tipo || !data || !municipio || !bairro || !descricao || !coordenadas.lat || !coordenadas.lon) {
      toast.warn('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/ocorrencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Erro ao salvar ocorrência');
      toast.success('Ocorrência registrada com sucesso!');
      setForm({ tipo: '', data: '', municipio: '', bairro: '', descricao: '', coordenadas: { lat: '', lon: '' } });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar ocorrência.');
    } finally {
      setIsLoading(false);
    }
  };

  function ClickHandler() {
    useMapEvents({
      click(e) {
        setForm((f) => ({
          ...f,
          coordenadas: {
            lat: e.latlng.lat.toFixed(6),
            lon: e.latlng.lng.toFixed(6)
          }
        }));
      }
    });
    return null;
  }

  const labelStyle = { fontWeight: 'bold', display: 'block', marginBottom: '4px' };
  const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' };
  const bairros = form.municipio ? bairrosPorMunicipio[form.municipio] || [] : [];

  return (
    <>
      {/* Cabeçalho fixo */}
      <div style={{
        backgroundColor: '#0b78d1',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="CrimWatch" style={{ height: '40px', marginRight: '10px' }} />
          <span style={{ color: '#333', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'Arial, sans-serif', textShadow: '1px 1px 1px rgba(0,0,0,0.2)' }}>
            CRIM<span style={{ color: 'red' }}>WATCH</span>
          </span>
        </div>
        <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: 'white', textDecoration: 'none' }}>Pagina Inicial</a></li>
          <li><a href="/ranking" style={{ color: 'white', textDecoration: 'none' }}>Ranking</a></li>
          <li><a href="/admin" style={{ color: 'white', textDecoration: 'none' }}>Painel Admin</a></li>
          <li><a href="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</a></li>
        </ul>
      </div>

      <div style={{ height: '70px' }} />

      {/* Formulário principal */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 12px rgba(0,0,0,0.08)', fontFamily: 'Arial, sans-serif' }}>
        <h2>Nova Ocorrência</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <label htmlFor="tipo" style={labelStyle}>Tipo de Ocorrência:</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required style={inputStyle}>
                <option value="">Selecione um tipo</option>
                {tiposDeCrime.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="data" style={labelStyle}>Data:</label>
              <input id="data" name="data" type="date" value={form.data} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label htmlFor="municipio" style={labelStyle}>Município:</label>
              <select id="municipio" name="municipio" value={form.municipio} onChange={handleChange} required style={inputStyle}>
                <option value="">Selecione um município</option>
                {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bairro" style={labelStyle}>Bairro:</label>
              <select id="bairro" name="bairro" value={form.bairro} onChange={handleChange} required style={inputStyle}>
                <option value="">Selecione um bairro</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="lat" style={labelStyle}>Latitude:</label>
              <input id="lat" name="lat" type="number" value={form.coordenadas.lat} readOnly style={inputStyle} />
            </div>
            <div>
              <label htmlFor="lon" style={labelStyle}>Longitude:</label>
              <input id="lon" name="lon" type="number" value={form.coordenadas.lon} readOnly style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="descricao" style={labelStyle}>Descrição:</label>
            <textarea id="descricao" name="descricao" value={form.descricao} onChange={handleChange} rows={3} required style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <label style={{ ...labelStyle, fontSize: '1rem' }}>Clique no mapa para escolher a localização:</label>
          <div style={{ height: 300, border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
            <MapContainer
              center={[-23.9608, -46.3336]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => { mapRef.current = map; }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <ClickHandler />
              {form.coordenadas.lat && form.coordenadas.lon && (
                <Marker position={[parseFloat(form.coordenadas.lat), parseFloat(form.coordenadas.lon)]}>
                  <Popup>
                    {form.bairro || `Lat: ${form.coordenadas.lat}, Lon: ${form.coordenadas.lon}`}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#0b78d1',
              color: 'white',
              fontSize: '1rem',
              padding: '0.6rem 1.2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar closeOnClick />
      </div>
    </>
  );
}
