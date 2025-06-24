import api from '../../api/axiosInstance';
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useAuth } from '../../contexts/AuthContext';
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
import { ToastContainer, Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './NovaOcorrencia.css';

// Fix para os ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
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

// Coordenadas corrigidas e mais precisas para cada bairro
const coordenadasPorBairro = {
  // Santos - coordenadas mais precisas
  'Santos-Centro': [-23.9370, -46.3270],
  'Santos-Gonzaga': [-23.9650, -46.3340],
  'Santos-Boqueirão': [-23.9710, -46.3400],
  'Santos-Aparecida': [-23.9440, -46.3290],

  // São Vicente - coordenadas corrigidas
  'São Vicente-Itararé': [-23.9580, -46.3890],
  'São Vicente-Catiapoã': [-23.9630, -46.3950],

  // Praia Grande - coordenadas mais específicas
  'Praia Grande-Canto do Forte': [-24.0080, -46.4050],
  'Praia Grande-Boqueirão': [-24.0030, -46.4080],

  // Guarujá - coordenadas ajustadas
  'Guarujá-Enseada': [-23.9920, -46.2570],
  'Guarujá-Astúrias': [-23.9860, -46.2500]
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
  const [mapKey, setMapKey] = useState(0);
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

  // Função para redimensionar o mapa
  const resizeMap = () => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  };

  useEffect(() => {
    // Força o redimensionamento do mapa após o componente montar
    const timer = setTimeout(() => {
      if (mapRef.current) {
        resizeMap();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // useEffect para mudança de município - LIMPA O BAIRRO
  useEffect(() => {
    if (form.municipio) {
      // Limpa o bairro quando o município muda para evitar inconsistências
      setForm(f => ({ ...f, bairro: '' }));

      // Move o mapa para o município
      if (coordenadasPorMunicipio[form.municipio] && mapRef.current) {
        const [lat, lon] = coordenadasPorMunicipio[form.municipio];
        console.log('Movendo mapa para município:', form.municipio, lat, lon);

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 14);
          }
        }, 100);
      }
    }
  }, [form.municipio]);

  // useEffect CORRIGIDO para mudança de bairro
  useEffect(() => {
    if (form.bairro && form.municipio && mapRef.current) {
      const chave = `${form.municipio}-${form.bairro}`;
      console.log('🔍 Buscando coordenadas para:', chave);

      if (coordenadasPorBairro[chave]) {
        const [lat, lon] = coordenadasPorBairro[chave];
        console.log('✅ Coordenadas encontradas:', lat, lon);

        // Delay maior para garantir que o mapa esteja pronto
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 16); // Zoom específico para bairro
            console.log('🗺️ Mapa movido para:', lat, lon, 'Zoom: 16');
          }
        }, 300); // Aumentei para 300ms
      } else {
        console.error('❌ Coordenadas não encontradas para:', chave);
        console.log('Coordenadas disponíveis:', Object.keys(coordenadasPorBairro));
      }
    }
  }, [form.bairro, form.municipio]); // Dependências corretas

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tipo, data, municipio, bairro, descricao, coordenadas } = form;

    if (!tipo || !data || !municipio || !bairro || !descricao || !coordenadas.lat || !coordenadas.lon) {
      toast.warn('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/ocorrencias', {
        ...form,
        usuarioId: usuario?.id
      });
      toast.success('Ocorrência registrada com sucesso!');
      setForm({
        tipo: '',
        data: '',
        municipio: '',
        bairro: '',
        descricao: '',
        coordenadas: { lat: '', lon: '' }
      });

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
    <div className="nova-ocorrencia-container">
      <div className="nova-ocorrencia-content">
        <div className="nova-ocorrencia-form-section">
          <div className="nova-ocorrencia-header">
            <h2 className="nova-ocorrencia-title">Nova Ocorrência</h2>
          </div>

          <form onSubmit={handleSubmit} className="nova-ocorrencia-form">
            <div className="nova-ocorrencia-form-row">
              <div className="nova-ocorrencia-field">
                <label htmlFor="tipo" className="nova-ocorrencia-label">
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
            </div>

            <div className="nova-ocorrencia-form-row">
              <div className="nova-ocorrencia-field">
                <label htmlFor="municipio" className="nova-ocorrencia-label">
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
                  Bairro <span className="nova-ocorrencia-required">*</span>
                </label>
                <select
                  id="bairro"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  required
                  className="nova-ocorrencia-select"
                  disabled={!form.municipio}
                >
                  <option value="">
                    {form.municipio ? 'Selecione um bairro' : 'Primeiro selecione um município'}
                  </option>
                  {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="nova-ocorrencia-coordinates-row">
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
                Descrição <span className="nova-ocorrencia-required">*</span>
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows={3}
                required
                className="nova-ocorrencia-textarea"
                placeholder="Descreva os detalhes da ocorrência..."
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              className="nova-ocorrencia-submit-button"
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
          </form>
        </div>

        <div className="nova-ocorrencia-map-section">
          <div className="nova-ocorrencia-map-header">
            <h3>Localização da Ocorrência</h3>
            <p>Clique no mapa para selecionar o local</p>
          </div>
          <div className="nova-ocorrencia-map-container">
            <MapContainer
              key={mapKey}
              center={[-23.9608, -46.3336]}
              zoom={13}
              style={{ height: '100%', width: '100%', minHeight: '500px' }}
              ref={mapRef}
              whenReady={() => {
                setTimeout(() => {
                  if (mapRef.current) {
                    mapRef.current.invalidateSize();
                  }
                }, 200);
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <ClickHandler />
              {form.coordenadas.lat && form.coordenadas.lon && (
                <Marker position={[parseFloat(form.coordenadas.lat), parseFloat(form.coordenadas.lon)]}>
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
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
        transition={Bounce}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
        style={{
          fontSize: '14px',
          fontWeight: '500'
        }}
      />
    </div>
  );
}