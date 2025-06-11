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
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
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
  const [filtros, setFiltros] = useState({
    roubos: true,
    furtos: true,
    estupro: true,
    policialMorto: true
  });

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

            {ocorrenciasFiltradas.map(oc => (
              <Marker
                key={oc._id}
                position={[oc.coordenadas.lat, oc.coordenadas.lon]}
              >
                <Popup>
                  <strong>{oc.tipo}</strong><br />
                  {oc.bairro}, {oc.municipio}<br />
                  {new Date(oc.data).toLocaleDateString()}<br />
                  {oc.descricao}<br /><br />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
}