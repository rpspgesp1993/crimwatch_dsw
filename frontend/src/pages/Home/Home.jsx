import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import LControlGeocoder from 'leaflet-control-geocoder';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../../components/SearchBar';
import { getColorByIndice } from '../../utils/colors';
import { calcularDensidade } from '../../utils/densidade';
import populacao from '../../data/populacao';
import './Home.css';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeocoderControl = () => {
  const map = useMap();
  useEffect(() => {
    const geocoder = new LControlGeocoder({ defaultMarkGeocode: true }).addTo(map);
    return () => {
      try {
        map.removeControl(geocoder);
      } catch (error) {
        console.warn('Erro ao remover geocoder:', error);
      }
    };
  }, [map]);
  return null;
};

const ZoomController = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom());
    },
  });
  return null;
};

// Componente para gerenciar a legenda
const LegendControl = ({ densidadePorBairro }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 10, 20, 50, 100, 200];
      const labels = grades.map((g, i) => {
        const next = grades[i + 1] || '+';
        return `<i style="background:${getColorByIndice(g + 1)}"></i> ${g}${next !== '+' ? `–${next}` : '+'}`;
      });
      div.innerHTML = labels.join('<br>');
      return div;
    };
    
    legend.addTo(map);
    
    return () => {
      try {
        legend.remove();
      } catch (error) {
        console.warn('Erro ao remover legenda:', error);
      }
    };
  }, [map, densidadePorBairro]);
  
  return null;
};

const ZOOM_THRESHOLD = 14;

// Função para criar ícones SVG customizados
const createCustomIcon = (color, strokeColor) => {
  return new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" stroke="${strokeColor}" stroke-width="1" d="M12.5,0 C19.4,0 25,5.6 25,12.5 C25,19.4 12.5,41 12.5,41 C12.5,41 0,19.4 0,12.5 C0,5.6 5.6,0 12.5,0 Z"/>
        <circle fill="#ffffff" cx="12.5" cy="12.5" r="4"/>
      </svg>`),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Definindo os ícones customizados
const redIcon = createCustomIcon('#dc2626', '#991b1b');
const blueIcon = createCustomIcon('#3b82f6', '#1e40af');
const greenIcon = createCustomIcon('#059669', '#047857');
const orangeIcon = createCustomIcon('#ea580c', '#c2410c');
const grayIcon = createCustomIcon('#6b7280', '#4b5563');

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [showMunicipios, setShowMunicipios] = useState(false);
  const [municipiosData, setMunicipiosData] = useState(null);
  const [showBairros, setShowBairros] = useState(false);
  const [bairrosData, setBairrosData] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(11);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Para forçar remontagem do mapa se necessário

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
    setIsSearching(false);
  };

  const handleSelectSearchResult = (place) => {
    setSearchQuery(place.display_name);
    setSearchResults([]);
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    // Verifica se o mapRef existe antes de usar
    if (mapRef.current && mapRef.current.setView) {
      mapRef.current.setView([lat, lon], 16);
      L.marker([lat, lon], { icon: redIcon }).addTo(mapRef.current)
        .bindPopup(`<b>${place.display_name}</b>`)
        .openPopup();
    }
  };

  // Sistema de filtros atualizado com todos os tipos de ocorrência
  const [filtros, setFiltros] = useState({
    roubos: true,
    furtos: true,
    homicidios: true,
    vandalismo: true,
    outros: true,
  });

  const handleFiltroChange = (tipo) => {
    // Mapeamento mais claro e direto
    const tipoMap = {
      'Roubos': 'roubos',
      'Furtos': 'furtos',
      'Homicídios': 'homicidios',
      'Vandalismo': 'vandalismo',
      'Outros': 'outros',
    };

    const key = tipoMap[tipo];
    if (key) {
      setFiltros((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const deletarOcorrencia = async (id) => {
    if (!window.confirm('Deseja remover esta ocorrência?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/ocorrencias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.mensagem || 'Removida com sucesso');
      setOcorrencias((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar ocorrência');
    }
  };

  // Sistema de filtros aprimorado
  const ocorrenciasFiltradas = ocorrencias.filter((o) => {
    const tipo = o.tipo.toLowerCase();
    
    // Filtrar "policial morto em serviço" - remover completamente
    if (tipo.includes('policial morto')) {
      return false;
    }
    
    // Verifica se a ocorrência corresponde a algum filtro ativo
    let matchesFiltro = false;
    
    if (tipo.includes('roubo') && filtros.roubos) {
      matchesFiltro = true;
    } else if (tipo.includes('furto') && filtros.furtos) {
      matchesFiltro = true;
    } else if (tipo.includes('homicídio') && filtros.homicidios) {
      matchesFiltro = true;
    } else if (tipo.includes('vandalismo') && filtros.vandalismo) {
      matchesFiltro = true;
    } else if (filtros.outros && !tipo.includes('roubo') && !tipo.includes('furto') && !tipo.includes('homicídio') && !tipo.includes('vandalismo')) {
      matchesFiltro = true;
    }

    // Verifica se corresponde à busca por texto
    const matchesSearch = !searchQuery || 
      o.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.municipio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tipo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFiltro && matchesSearch;
  });

  const densidadePorBairro = useMemo(() => {
    return calcularDensidade(ocorrenciasFiltradas, populacao);
  }, [ocorrenciasFiltradas]);

  useEffect(() => {
    if (showMunicipios) {
      fetch('/MUNICIPIOS_SP.geojson')
        .then((r) => r.json())
        .then(setMunicipiosData)
        .catch((err) => console.error('Erro ao carregar municípios:', err));
    } else {
      setMunicipiosData(null);
    }
  }, [showMunicipios]);

  useEffect(() => {
    if (showBairros) {
      fetch('/BAIRROS_COM_MUNICIPIOS.geojson')
        .then((r) => r.json())
        .then(setBairrosData)
        .catch((err) => console.error('Erro ao carregar bairros:', err));
    } else {
      setBairrosData(null);
    }
  }, [showBairros]);

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/ocorrencias', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOcorrencias)
      .catch((err) => console.error('Erro ocorrências:', err));
  }, [location]);

  const styleBairros = (feature) => {
    const bairro = feature.properties.NM_BAIRRO;
    const municipio = feature.properties.NM_MUN;
    const chave = `${municipio}::${bairro}`;
    const indice = densidadePorBairro[chave] || 0;

    return {
      fillColor: getColorByIndice(indice),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const onEachMunicipio = (feature, layer) => {
    const nomeMunicipio = feature.properties.NM_MUN || 'Município desconhecido';
    layer.bindPopup(`<strong>Município:</strong> ${nomeMunicipio}`);
  };

  const onEachBairro = (feature, layer) => {
    const nomeBairro = feature.properties.NM_BAIRRO || 'Bairro desconhecido';
    const nomeMunicipio = feature.properties.NM_MUN || 'Município desconhecido';

    layer.bindPopup(
      `<strong>Bairro:</strong> ${nomeBairro}<br /><strong>Município:</strong> ${nomeMunicipio}`
    );
  };

  const getCircleRadius = (zoom) => {
    const baseRadius = 8;
    const zoomFactor = Math.max(1, zoom - ZOOM_THRESHOLD + 1);
    return Math.min(35, baseRadius + zoomFactor * 6);
  };

  // Função para obter cor e ícone baseado no tipo de ocorrência
  const getOcorrenciaStyle = (tipo) => {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('roubo')) {
      return { color: '#dc2626', icon: redIcon };
    } else if (tipoLower.includes('furto')) {
      return { color: '#3b82f6', icon: blueIcon };
    } else if (tipoLower.includes('homicídio')) {
      return { color: '#059669', icon: greenIcon };
    } else if (tipoLower.includes('vandalismo')) {
      return { color: '#ea580c', icon: orangeIcon };
    } else {
      return { color: '#6b7280', icon: grayIcon };
    }
  };

  const renderOcorrencia = (oc) => {
    const { color, icon } = getOcorrenciaStyle(oc.tipo);

    const popupContent = `
      <div>
        <strong>${oc.tipo}</strong><br />
        ${oc.bairro}, ${oc.municipio}<br />
        ${new Date(oc.data).toLocaleDateString()}<br />
        ${oc.descricao}<br /></br />
      </div>
    `;

    if (zoomLevel >= ZOOM_THRESHOLD) {
      return (
        <CircleMarker
          key={oc._id}
          center={[oc.coordenadas.lat, oc.coordenadas.lon]}
          radius={getCircleRadius(zoomLevel)}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.6,
            weight: 1,
          }}
        >
          <Popup>
            <div dangerouslySetInnerHTML={{ __html: popupContent }} />
          </Popup>
        </CircleMarker>
      );
    }

    return (
      <Marker
        key={oc._id}
        position={[oc.coordenadas.lat, oc.coordenadas.lon]}
        icon={icon}
      >
        <Popup>
          <div dangerouslySetInnerHTML={{ __html: popupContent }} />
        </Popup>
      </Marker>
    );
  };

  // Função para lidar com a criação do mapa
  const handleMapCreated = (mapInstance) => {
    mapRef.current = mapInstance;
    
    // Aguarda um pouco antes de tentar redimensionar
    setTimeout(() => {
      if (mapRef.current && mapRef.current.invalidateSize) {
        try {
          mapRef.current.invalidateSize();
        } catch (error) {
          console.warn('Erro ao invalidar tamanho do mapa:', error);
        }
      }
    }, 100);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
        <Box className="form-container" sx={{ width: 300, overflowY: 'auto', p: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Limites Geográficos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={
                  <Switch
                    checked={showMunicipios}
                    onChange={() => setShowMunicipios(!showMunicipios)}
                  />
                }
                label="Municípios"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showBairros}
                    onChange={() => setShowBairros(!showBairros)}
                  />
                }
                label="Bairros"
              />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Tipos de Ocorrências</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {[
                { label: 'Roubos', key: 'roubos', color: '#dc2626' },
                { label: 'Furtos', key: 'furtos', color: '#3b82f6' },
                { label: 'Homicídios', key: 'homicidios', color: '#059669' },
                { label: 'Vandalismo', key: 'vandalismo', color: '#ea580c' },
                { label: 'Outros', key: 'outros', color: '#6b7280' },
              ].map((item) => (
                <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filtros[item.key]}
                        onChange={() => handleFiltroChange(item.label)}
                      />
                    }
                    label={item.label}
                    sx={{ flexGrow: 1 }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: item.color,
                      borderRadius: '50%',
                      ml: 1,
                    }}
                  />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          <Box 
            className="stats-container" 
            sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography 
              variant="h6" 
              className="stats-title"
              sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}
            >
              📊 Estatísticas
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '14px' }}>
                <strong>Total de ocorrências:</strong> {ocorrencias.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '14px' }}>
                <strong>Ocorrências exibidas:</strong> {ocorrenciasFiltradas.length}
              </Typography>
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ mb: 1.5, fontWeight: 'bold', color: '#555' }}
            >
              Por tipo:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Roubos', key: 'roubo', color: '#dc2626' },
                { label: 'Furtos', key: 'furto', color: '#3b82f6' },
                { label: 'Homicídios', key: 'homicídio', color: '#059669' },
                { label: 'Vandalismo', key: 'vandalismo', color: '#ea580c' },
                { label: 'Outros', key: 'outros', color: '#6b7280' },
              ].map((item) => {
                const count = ocorrenciasFiltradas.filter(o => {
                  const tipo = o.tipo.toLowerCase();
                  
                  if (item.key === 'outros') {
                    return !tipo.includes('roubo') && !tipo.includes('furto') && 
                           !tipo.includes('homicídio') && !tipo.includes('vandalismo');
                  }
                  return tipo.includes(item.key);
                }).length;
                
                return (
                  <Box 
                    key={item.key} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1,
                      backgroundColor: 'white',
                      borderRadius: 0.5,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '13px' }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '13px',
                        color: item.color 
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box className="map-container" sx={{ flexGrow: 1, height: '100%' }}>
          <MapContainer
            key={mapKey}
            center={[-23.9608, -46.3336]}
            zoom={11}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
            whenCreated={handleMapCreated}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomController setZoomLevel={setZoomLevel} />
            <GeocoderControl />
            <LegendControl densidadePorBairro={densidadePorBairro} />
            
            {showMunicipios && municipiosData && (
              <GeoJSON
                data={municipiosData}
                style={{
                  fillColor: '#3388ff',
                  weight: 2,
                  color: 'white',
                  fillOpacity: 0.3
                }}
                onEachFeature={onEachMunicipio}
              />
            )}

            {showBairros && bairrosData && (
              <GeoJSON
                data={bairrosData}
                style={styleBairros}
                onEachFeature={onEachBairro}
              />
            )}

            {ocorrenciasFiltradas
              .filter((o) => o.coordenadas?.lat && o.coordenadas?.lon)
              .map((oc) => renderOcorrencia(oc))}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
}