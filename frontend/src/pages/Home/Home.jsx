// Importa bibliotecas React e hooks necessários
import React, { useEffect, useRef, useState } from 'react';

// Importa Leaflet (biblioteca de mapas)
import L from 'leaflet';

// Importa componentes da biblioteca MUI (Material UI) para estilização e UI
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Button,
  Menu,
  MenuItem
} from '@mui/material';

// Ícone de seta para expandir o Accordion
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Importa componentes do React Leaflet (wrapper para Leaflet no React)
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';

// Importa estilos do Leaflet e do geocoder
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Importa controle de geocodificação do Leaflet
import 'leaflet-control-geocoder';

// Importa estilos personalizados da página
import './Home.css';

// Importa componente de barra de busca
import SearchBar from '../../components/SearchBar';

// Importa NavLink do react-router-dom para navegação
import { NavLink } from 'react-router-dom';

// Importa logo (supondo que esteja na pasta assets)
import logo from '../../assets/logoCrimWatch.png';


// Componente GeocoderControl: adiciona barra de busca por endereço ao mapa
const GeocoderControl = () => {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({ defaultMarkGeocode: true }).addTo(map);

    return () => map.removeControl(geocoder);
  }, [map]);

  return null;
};


// Componente principal da página Home
export default function Home() {
  const mapRef = useRef(null);

  // Estados para alternar visibilidade de camadas de municípios e bairros
  const [showMunicipios, setShowMunicipios] = useState(false);
  const [municipiosData, setMunicipiosData] = useState(null);
  const [showBairros, setShowBairros] = useState(false);
  const [bairrosData, setBairrosData] = useState(null);

  const [ocorrencias, setOcorrencias] = useState([]);

  // Estado para armazenar usuário logado
  const [usuario, setUsuario] = useState(localStorage.getItem('user') || null);

  // Estados para controle do menu de login
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Carrega arquivos GeoJSON locais (removi espaços dos nomes)
  useEffect(() => {
    fetch('/municipiosBS.geojson')
      .then(r => r.json())
      .then(setMunicipiosData)
      .catch(err => console.error('Erro municípios', err));

    fetch('/bairrosBS.geojson')
      .then(r => r.json())
      .then(setBairrosData)
      .catch(err => console.error('Erro bairros', err));
  }, []);

  // Busca ocorrências do backend
  useEffect(() => {
    fetch('http://localhost:4000/api/ocorrencias')
      .then(r => r.json())
      .then(setOcorrencias)
      .catch(err => console.error('Erro ocorrências:', err));
  }, []);

  // Optional: escuta mudanças no localStorage feitas em outra aba
  useEffect(() => {
    const handleStorageChange = () => {
      setUsuario(localStorage.getItem('user'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const deletarOcorrencia = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta ocorrência?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/ocorrencias/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      alert(data.mensagem || 'Removida com sucesso');
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao deletar ocorrência');
    }
  };

  return (
    <Box>
      {/* Barra superior de navegação */}
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Logo e título */}
            <img src={logo} alt="CrimWatch" style={{ height: '40px', marginRight: '16px' }} />
          </Box>

          {/* Links de navegação e botão de login */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NavLink to="/nova" style={{ color: 'white', textDecoration: 'none' }}>
              Registrar Ocorrências
            </NavLink>
            <NavLink to="/ranking" style={{ color: 'white', textDecoration: 'none' }}>
              Ranking de Crimes
            </NavLink>
            <div>
              <Button onClick={handleMenuClick} style={{ color: 'white' }}>
                {usuario || 'Entrar'}
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {!usuario && (
                  <MenuItem onClick={() => {
                    handleClose();
                    window.location.href = '/login';
                  }}>
                    Login
                  </MenuItem>
                )}
                {usuario && (
                  <MenuItem onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUsuario(null);
                    handleClose();
                    window.location.href = '/login';
                  }}>
                    Sair
                  </MenuItem>
                )}
              </Menu>
            </div>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Container principal */}
      <Box className="container" sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
        {/* Painel lateral */}
        <Box className="form-container" sx={{ width: '300px', overflowY: 'auto', p: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Limites Geográficos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={<Switch checked={showMunicipios} onChange={() => setShowMunicipios(!showMunicipios)} />}
                label="Municípios"
              />
              <FormControlLabel
                control={<Switch checked={showBairros} onChange={() => setShowBairros(!showBairros)} />}
                label="Bairros"
              />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Tipos de Ocorrências</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel control={<Switch />} label="Roubos" />
              <FormControlLabel control={<Switch />} label="Furtos" />
              <FormControlLabel control={<Switch />} label="Estupro" />
              <FormControlLabel control={<Switch />} label="Policial morto em serviço" />
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Container do Mapa */}
        <Box className="map-container" sx={{ flexGrow: 1, height: '100%' }}>
          <SearchBar
            onSelect={(lat, lon) => mapRef.current && mapRef.current.setView([lat, lon], 15)}
          />

          <MapContainer
            center={[-23.9608, -46.3336]}
            zoom={11}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
            whenCreated={map => (mapRef.current = map)}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <GeocoderControl />

            {showMunicipios && municipiosData && (
              <GeoJSON
                data={municipiosData}
                style={{ color: '#1976d2', weight: 2, fillOpacity: 0.2 }}
                onEachFeature={(f, l) =>
                  l.bindPopup(`<strong>${f.properties?.name || f.properties?.NOME || 'Sem nome'}</strong>`)
                }
              />
            )}

            {showBairros && bairrosData && (
              <GeoJSON
                data={bairrosData}
                style={{ color: '#d32f2f', weight: 1.5, fillOpacity: 0.15 }}
                onEachFeature={(f, l) =>
                  l.bindPopup(`<strong>${f.properties?.name || f.properties?.NOME || 'Sem nome'}</strong>`)
                }
              />
            )}

            {ocorrencias.map(oc => (
              <Marker
                key={oc._id}
                position={[oc.coordenadas.lat, oc.coordenadas.lon]} // confirme os nomes lat/lon
              >
                <Popup>
                  <strong>{oc.tipo}</strong><br />
                  {oc.bairro}, {oc.municipio}<br />
                  {new Date(oc.data).toLocaleDateString()}<br />
                  {oc.descricao}<br /><br />
                  <button
                    style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 4, border: 'none', backgroundColor: '#d32f2f', color: 'white' }}
                    onClick={() => deletarOcorrencia(oc._id)}
                  >
                    Excluir
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </Box>

      {/* Rodapé */}
      <Box component="footer" sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2">© 2025 CrimWatch</Typography>
      </Box>
    </Box>
  );
}
