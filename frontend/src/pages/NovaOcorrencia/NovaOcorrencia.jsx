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
import { bairrosPorMunicipio } from '../../data/bairrosPorMunicipio.js';
import { coordenadasPorBairro } from '../../data/coordenadasPorBairro';
import * as turf from '@turf/turf';

// Fix para os ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const tiposDeCrime = ['Roubos', 'Furtos', 'Policial morto em serviço'];
const municipios = Object.keys(bairrosPorMunicipio);

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
  const [municipiosGeojson, setMunicipiosGeojson] = useState(null);
  const [bairrosGeojson, setBairrosGeojson] = useState(null);


  // **Estados para barra de busca**
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const resizeMap = () => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        resizeMap();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

useEffect(() => {
  if (form.municipio) {
    setForm(f => {
      const bairrosDoMunicipio = bairrosPorMunicipio[form.municipio] || [];
      if (bairrosDoMunicipio.includes(f.bairro)) {
        return f; // Bairro válido, mantém o estado
      }
      return { ...f, bairro: '' }; // Bairro inválido, limpa o bairro
    });
  }
}, [form.municipio]);

useEffect(() => {
  if (!form.municipio || !mapRef.current || !bairrosGeojson) return;

  // Normaliza nome para comparação segura
  const municipioSelecionado = form.municipio.trim().toLowerCase();

  // Filtra bairros do município (comparação case-insensitive)
  const bairrosDoMunicipio = bairrosGeojson.features.filter(
    (f) => f.properties.NM_MUN.trim().toLowerCase() === municipioSelecionado
  );

  if (form.bairro) {
    // Bairro selecionado: zoom no bairro e atualiza coordenadas
    const bairroFeature = bairrosDoMunicipio.find(
      (f) => f.properties.NM_BAIRRO.trim().toLowerCase() === form.bairro.trim().toLowerCase()
    );

    if (bairroFeature) {
      const bounds = L.geoJSON(bairroFeature).getBounds();
      mapRef.current.fitBounds(bounds);

      const centroid = turf.centroid(bairroFeature);
      const [lon, lat] = centroid.geometry.coordinates;

      setForm(f => ({
        ...f,
        coordenadas: {
          lat: lat.toFixed(6),
          lon: lon.toFixed(6),
        },
      }));
    }
  } else {
    // Nenhum bairro selecionado: zoom no município todo e atualiza coordenadas do centróide do município
if (bairrosDoMunicipio.length > 0) {
  let centroidMunicipio;

if (bairrosDoMunicipio.length > 1) {
  // ===== CORREÇÃO: Cria uma FeatureCollection com os bairros
  const featureCollection = turf.featureCollection(bairrosDoMunicipio);
  const combined = turf.combine(featureCollection);

  if (combined && combined.features.length > 0) {
    centroidMunicipio = turf.centroid(combined.features[0]); // pega primeiro MultiPolygon
  }
} else {
  // Apenas um bairro, calcula centróide direto
  centroidMunicipio = turf.centroid(bairrosDoMunicipio[0]);
}

  if (centroidMunicipio) {
    const [lon, lat] = centroidMunicipio.geometry.coordinates;

    setForm(f => ({
      ...f,
      coordenadas: {
        lat: lat.toFixed(6),
        lon: lon.toFixed(6),
      },
    }));
  } else {
    // fallback para centro dos bounds se cálculo do centróide falhar
    const group = L.geoJSON(bairrosDoMunicipio);
    const bounds = group.getBounds();
    const center = bounds.getCenter();

    setForm(f => ({
      ...f,
      coordenadas: {
        lat: center.lat.toFixed(6),
        lon: center.lng.toFixed(6),
      },
    }));
  }

  // Ajusta o zoom do mapa para os bairros do município
      const group = L.geoJSON(bairrosDoMunicipio);
      mapRef.current.fitBounds(group.getBounds());
    }
  }
}, [form.municipio, form.bairro, bairrosGeojson]);

  useEffect(() => {
  const loadGeojsons = async () => {
    try {
      const [munRes, baiRes] = await Promise.all([
        fetch('/MUNICIPIOS_SP.geojson'),
        fetch('/BAIRROS_COM_MUNICIPIOS.geojson')
      ]);
      const municipiosData = await munRes.json();
      const bairrosData = await baiRes.json();
      setMunicipiosGeojson(municipiosData);
      setBairrosGeojson(bairrosData);
    } catch (error) {
      console.error('Erro ao carregar GeoJSONs:', error);
    }
  };
  loadGeojsons();
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  const { tipo, data, municipio, bairro, descricao, coordenadas } = form;
  if (!tipo || !data || !municipio || !bairro || !descricao || !coordenadas.lat || !coordenadas.lon) {
    toast.warn('Preencha todos os campos obrigatórios.');
    return;
  }
  setIsLoading(true);
  
  const token = localStorage.getItem('token');
  console.log('Token do localStorage:', token);
  
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    console.log('Headers que serão enviados:', config.headers);
    
    await api.post('/ocorrencias', {
      ...form,
      usuarioId: usuario?.id,
    }, config);

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
    // Tratamento do token expirado/inválido
    if (err.response) {
      const msg = err.response.data.error || err.response.data.detail || '';
      if (msg.toLowerCase().includes('token expirado')) {
        toast.error('Seu login expirou. Faça login novamente.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (msg.toLowerCase().includes('token inválido')) {
        toast.error('Token inválido. Faça login novamente.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      // Outros erros do servidor
      toast.error(`Erro: ${msg}`);
    } else {
      toast.error('Erro de conexão. Tente novamente mais tarde.');
    }
  } finally {
    setIsLoading(false);
  }
};





function ClickHandler() {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      // Atualiza coordenadas no formulário
      setForm((f) => ({
        ...f,
        coordenadas: {
          lat: lat.toFixed(6),
          lon: lon.toFixed(6),
        }
      }));

      // Se os bairros forem carregados
      if (bairrosGeojson) {
        const point = turf.point([lon, lat]);
        const bairroFeature = bairrosGeojson.features.find(feature =>
          turf.booleanPointInPolygon(point, feature)
        );

        if (bairroFeature) {
          const nomeBairro = bairroFeature.properties.NM_BAIRRO;
          const nomeMunicipio = bairroFeature.properties.NM_MUN;

          console.log('Bairro encontrado no clique:', nomeBairro);
          console.log('Município correspondente:', nomeMunicipio);

          setForm(f => ({
            ...f,
            bairro: nomeBairro,
            municipio: nomeMunicipio
          }));
        } else {
          console.log('Nenhum bairro encontrado para esse ponto.');
        }
      }
    }
  });

  return null;
}


  // Função para buscar endereço usando Nominatim
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
   const res = await fetch(
  `/api/nominatim?q=${encodeURIComponent(value)}`
);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Quando usuário seleciona endereço da lista
  const handleSelectSearchResult = (place) => {
    setSearchQuery(place.display_name);
    setSearchResults([]);
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setForm((f) => ({
      ...f,
      coordenadas: { lat: lat.toFixed(6), lon: lon.toFixed(6) }
    }));

    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 12);
    }
  };

const bairros = React.useMemo(() => {
  if (!form.municipio || !bairrosGeojson) return [];

  const bairrosSet = new Set(
    bairrosGeojson.features
      .filter(feature => feature.properties.NM_MUN === form.municipio)
      .map(feature => feature.properties.NM_BAIRRO.trim()) // remove espaços extras
  );

  return Array.from(bairrosSet).sort((a, b) => a.localeCompare(b));
}, [form.municipio, bairrosGeojson]);

  // --------- Função para testar token ---------
const testarToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Nenhum token encontrado.');
    return;
  }
  try {
    const response = await api.get('/test-token', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    toast.success('Token válido! 🎉');
    console.log('Resposta do teste de token:', response.data);
  } catch (error) {
    console.error('Erro ao testar token:', error);
    toast.error('Token inválido ou expirado.');
  }
};
// --------- Fim da função testarToken ---------
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

          {/* Barra de busca */}
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Buscar endereço..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
            {isSearching && (
              <div style={{ position: 'absolute', right: 10, top: 10 }}>Carregando...</div>
            )}
            {searchResults.length > 0 && (
              <ul
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  backgroundColor: 'white',
                  listStyle: 'none',
                  margin: 0,
                  padding: '5px',
                  width: '100%',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {searchResults.map((place) => (
                  <li
                    key={place.place_id}
                    onClick={() => handleSelectSearchResult(place)}
                    style={{ padding: '5px' }}
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
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

      <AppBar position="fixed" color="primary" className="app-bar">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Voltar"
            onClick={handleVoltar}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', fontFamily: 'monospace' }}
          >
            Nova Ocorrência
          </Typography>
          <Button
            startIcon={<PersonIcon />}
            color="inherit"
            sx={{ pointerEvents: 'none', cursor: 'default', textTransform: 'none' }}
          >
            {usuario?.nome || 'Usuário'}
          </Button>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Bounce}
      />
    </div>
  );
}
