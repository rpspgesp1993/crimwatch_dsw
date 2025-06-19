import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho conforme sua estrutura
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './Home.css';
import SearchBar from '../../components/SearchBar';

// Componente GeocoderControl
const GeocoderControl = () => {
  const map = useMap();
  useEffect(() => {
    const geocoder = L.Control.geocoder({ defaultMarkGeocode: true }).addTo(map);
    return () => map.removeControl(geocoder);
  }, [map]);
  return null;
};

// Componente para controlar o zoom e alternar entre Marker e CircleMarker
const ZoomController = ({ setZoomLevel }) => {
  const map = useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
    }
  });
  return null;
};

// Ícone customizado vermelho para os markers
const redIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#dc2626" stroke="#991b1b" stroke-width="1" d="M12.5,0 C19.4,0 25,5.6 25,12.5 C25,19.4 12.5,41 12.5,41 C12.5,41 0,19.4 0,12.5 C0,5.6 5.6,0 12.5,0 Z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="4"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Ref para acessar a instância do mapa
  const mapRef = useRef(null);

  // Estados
  const [showMunicipios, setShowMunicipios] = useState(false);
  const [municipiosData, setMunicipiosData] = useState(null);
  const [showBairros, setShowBairros] = useState(false);
  const [bairrosData, setBairrosData] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(11);
  const [filtros, setFiltros] = useState({
    roubos: true,
    furtos: true,
    estupro: true,
    policialMorto: true
  });

  // Nível de zoom limite para alternar entre marker e circle
  const ZOOM_THRESHOLD = 14;

  // Funções
  const handleFiltroChange = (tipo) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ocorrenciasFiltradas = ocorrencias.filter(ocorrencia => {
    const tipo = ocorrencia.tipo.toLowerCase();
    if (tipo.includes('roubo') && filtros.roubos) return true;
    if (tipo.includes('furto') && filtros.furtos) return true;
    if (tipo.includes('estupro') && filtros.estupro) return true;
    if (tipo.includes('policial') && tipo.includes('morto') && filtros.policialMorto) return true;
    return false;
  });

  // Efeitos
  useEffect(() => {
    fetch('/municipiosBS.geojson')
      .then(r => r.json())
      .then(setMunicipiosData)
      .catch(err => console.error('Erro municípios', err));

    fetch('/BAIRROS_BS.geojson')
      .then(r => r.json())
      .then(setBairrosData)
      .catch(err => console.error('Erro bairros', err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:4000/api/ocorrencias', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(setOcorrencias)
      .catch(err => console.error('Erro ocorrências:', err));
  }, []);

  const deletarOcorrencia = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta ocorrência?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/ocorrencias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      alert(data.mensagem || 'Removida com sucesso');
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao deletar ocorrência');
    }
  };

  // Função para calcular o raio do círculo baseado no zoom
  const getCircleRadius = (zoom) => {
    // Raio cresce exponencialmente com o zoom
    // Zoom 14: raio 12
    // Zoom 15: raio 18
    // Zoom 16: raio 25
    // Zoom 17+: raio 35
    const baseRadius = 8;
    const zoomFactor = Math.max(1, zoom - ZOOM_THRESHOLD + 1);
    return Math.min(35, baseRadius + (zoomFactor * 6));
  };

  // Função para renderizar ocorrência baseada no zoom
  const renderOcorrencia = (oc) => {
    const popupContent = (
      <div>
        <strong>{oc.tipo}</strong><br />
        {oc.bairro}, {oc.municipio}<br />
        {new Date(oc.data).toLocaleDateString()}<br />
        {oc.descricao}<br /><br />
      </div>
    );

    if (zoomLevel >= ZOOM_THRESHOLD) {
      // Zoom alto: mostra círculo vermelho que cresce com o zoom
      const circleRadius = getCircleRadius(zoomLevel);
      return (
        <CircleMarker
          key={oc._id}
          center={[oc.coordenadas.lat, oc.coordenadas.lon]}
          radius={circleRadius}
          pathOptions={{
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.6,
            weight: 2
          }}
        >
          <Popup>
            {popupContent}
          </Popup>
        </CircleMarker>
      );
    } else {
      // Zoom baixo: mostra marker vermelho
      return (
        <Marker
          key={oc._id}
          position={[oc.coordenadas.lat, oc.coordenadas.lon]}
          icon={redIcon}
        >
          <Popup>
            {popupContent}
          </Popup>
        </Marker>
      );
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
  
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
              <FormControlLabel
                control={
                  <Switch
                    checked={filtros.roubos}
                    onChange={() => handleFiltroChange('roubos')}
                  />
                }
                label="Roubos"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filtros.furtos}
                    onChange={() => handleFiltroChange('furtos')}
                  />
                }
                label="Furtos"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filtros.estupro}
                    onChange={() => handleFiltroChange('estupro')}
                  />
                }
                label="Estupro"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filtros.policialMorto}
                    onChange={() => handleFiltroChange('policialMorto')}
                  />
                }
                label="Policial morto em serviço"
              />
            </AccordionDetails>
          </Accordion>

          <Box className="stats-container">
            <Typography variant="body2" className="stats-title">
              Estatísticas
            </Typography>
            <Typography variant="body2" className="stats-item">
              Total de ocorrências: {ocorrencias.length}
            </Typography>
            <Typography variant="body2" className="stats-item">
              Ocorrências exibidas: {ocorrenciasFiltradas.length}
            </Typography>
          </Box>
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
            <ZoomController setZoomLevel={setZoomLevel} />

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

            {ocorrenciasFiltradas.map(oc => renderOcorrencia(oc))}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
}