import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho conforme sua estrutura
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './NovaOcorrencia.css';

// Corrige ícone do marcador padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const tiposDeCrime = ['Roubos', 'Furtos', 'Policial morto em serviço'];
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
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleVoltar = () => {
    navigate('/');
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/ocorrencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          usuarioId: usuario?.id // Adicionar ID do usuário logado
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Erro ao salvar ocorrência');
      }

      toast.success('Ocorrência registrada com sucesso!');
      setForm({
        tipo: '',
        data: '',
        municipio: '',
        bairro: '',
        descricao: '',
        coordenadas: { lat: '', lon: '' }
      });

      // Redirecionar para home após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro ao salvar ocorrência.');
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

  const bairros = form.municipio ? bairrosPorMunicipio[form.municipio] || [] : [];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Container principal */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <div className="nova-ocorrencia-container">
          {/* Formulário principal */}
          <div className="nova-ocorrencia-card">
            <h2 className="nova-ocorrencia-title">Registrar Nova Ocorrência</h2>

            <form onSubmit={handleSubmit}>
              <div className="nova-ocorrencia-form-grid">
                <div className="nova-ocorrencia-field">
                  <label htmlFor="tipo" className="nova-ocorrencia-label">
                    <span className="nova-ocorrencia-field-icon">🚨</span>
                    Tipo de Ocorrência <span className="nova-ocorrencia-required">*</span>
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    required
                    className="nova-ocorrencia-select"
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposDeCrime.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>

                <div className="nova-ocorrencia-field">
                  <label htmlFor="data" className="nova-ocorrencia-label">
                    <span className="nova-ocorrencia-field-icon">📅</span>
                    Data <span className="nova-ocorrencia-required">*</span>
                  </label>
                  <input
                    id="data"
                    name="data"
                    type="date"
                    value={form.data}
                    onChange={handleChange}
                    required
                    className="nova-ocorrencia-input"
                  />
                </div>

                <div className="nova-ocorrencia-field">
                  <label htmlFor="municipio" className="nova-ocorrencia-label">
                    <span className="nova-ocorrencia-field-icon">🏙️</span>
                    Município <span className="nova-ocorrencia-required">*</span>
                  </label>
                  <select
                    id="municipio"
                    name="municipio"
                    value={form.municipio}
                    onChange={handleChange}
                    required
                    className="nova-ocorrencia-select"
                  >
                    <option value="">Selecione um município</option>
                    {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="nova-ocorrencia-field">
                  <label htmlFor="bairro" className="nova-ocorrencia-label">
                    <span className="nova-ocorrencia-field-icon">🏘️</span>
                    Bairro <span className="nova-ocorrencia-required">*</span>
                  </label>
                  <select
                    id="bairro"
                    name="bairro"
                    value={form.bairro}
                    onChange={handleChange}
                    required
                    className="nova-ocorrencia-select"
                  >
                    <option value="">Selecione um bairro</option>
                    {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Seção de coordenadas */}
              <div className="nova-ocorrencia-coordinates">
                <div className="nova-ocorrencia-field">
                  <label htmlFor="lat" className="nova-ocorrencia-label">
                    Latitude <span className="nova-ocorrencia-required">*</span>
                  </label>
                  <input
                    id="lat"
                    name="lat"
                    type="number"
                    value={form.coordenadas.lat}
                    readOnly
                    className="nova-ocorrencia-input"
                    placeholder="Clique no mapa"
                  />
                </div>
                <div className="nova-ocorrencia-field">
                  <label htmlFor="lon" className="nova-ocorrencia-label">
                    Longitude <span className="nova-ocorrencia-required">*</span>
                  </label>
                  <input
                    id="lon"
                    name="lon"
                    type="number"
                    value={form.coordenadas.lon}
                    readOnly
                    className="nova-ocorrencia-input"
                    placeholder="Clique no mapa"
                  />
                </div>
              </div>

              <div className="nova-ocorrencia-field">
                <label htmlFor="descricao" className="nova-ocorrencia-label">
                  <span className="nova-ocorrencia-field-icon">📝</span>
                  Descrição <span className="nova-ocorrencia-required">*</span>
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="nova-ocorrencia-textarea"
                  placeholder="Descreva os detalhes da ocorrência..."
                />
              </div>

              {/* Seção do mapa */}
              <div className="nova-ocorrencia-map-section">
                <label className="nova-ocorrencia-map-label">
                  🗺️ Clique no mapa para escolher a localização <span className="nova-ocorrencia-required">*</span>
                </label>
                <div className="nova-ocorrencia-map-container">
                  <MapContainer
                    center={[-23.9608, -46.3336]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={(map) => { mapRef.current = map; }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ClickHandler />
                    {form.coordenadas.lat && form.coordenadas.lon && (
                      <Marker position={[form.coordenadas.lat, form.coordenadas.lon]}>
                        <Popup>
                          <div>
                            <strong>Local da Ocorrência</strong><br />
                            Lat: {form.coordenadas.lat}<br />
                            Lon: {form.coordenadas.lon}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>

              {/* Botão de envio */}
              <div className="nova-ocorrencia-submit-section">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                    }
                  }}
                >
                  {isLoading ? 'Salvando...' : 'Registrar Ocorrência'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Box>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
}