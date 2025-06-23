// Importação de hooks e objetos React
import React, { useEffect, useRef, useState, useMemo } from 'react';
// Importação da biblioteca Leaflet para mapas
import L from 'leaflet';
// Importação de componentes visuais do Material UI
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
// Ícone de expandir usado nos Accordions
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Importação de componentes do react-leaflet para mapas interativos
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
// Importação de estilos do Leaflet
import 'leaflet/dist/leaflet.css';
// Estilo adicional do controle de geocodificação
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
// Importação do controle de geocodificação Leaflet
import LControlGeocoder from 'leaflet-control-geocoder';
// Hook de autenticação do contexto da aplicação
import { useAuth } from '../../contexts/AuthContext';
// Hook para navegação entre rotas
import { useNavigate } from 'react-router-dom';
// Componente de barra de busca personalizada
import SearchBar from '../../components/SearchBar';
// Função para determinar cor de densidade
import { getColorByIndice } from '../../utils/colors';
// Função utilitária para calcular densidade populacional
import { calcularDensidade } from '../../utils/densidade';
// Dados de população por bairro
import populacao from '../../data/populacao';
// Importação do CSS específico dessa tela
import './Home.css';

/* Componente que adiciona o controle de geocodificação ao mapa */
const GeocoderControl = () => {
  const map = useMap(); // Hook para acessar o mapa
  useEffect(() => {
    const geocoder = new LControlGeocoder({ defaultMarkGeocode: true }).addTo(map);
    return () => map.removeControl(geocoder); // Limpeza do controle ao desmontar
  }, [map]);
  return null;
};

/* Componente que detecta mudança de zoom e atualiza o estado zoomLevel */
const ZoomController = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom()); // Atualiza o zoom no estado pai
    },
  });
  return null;
};

const ZOOM_THRESHOLD = 14; // Zoom limite para trocar entre marker e circlemarker

/* Ícone personalizado para marcadores (vermelho) */
const redIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#dc2626" stroke="#991b1b" stroke-width="1" d="M12.5,0 C19.4,0 25,5.6 25,12.5 C25,19.4 12.5,41 12.5,41 C12.5,41 0,19.4 0,12.5 C0,5.6 5.6,0 12.5,0 Z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="4"/>
    </svg>`), // Ícone SVG embutido em base64
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Componente principal da página
export default function Home() {
  const { logout } = useAuth(); // Função de logout
  const navigate = useNavigate(); // Navegação
  const mapRef = useRef(null); // Referência para o mapa

  // Estados para controle da interface
  const [showMunicipios, setShowMunicipios] = useState(false);
  const [municipiosData, setMunicipiosData] = useState(null);
  const [showBairros, setShowBairros] = useState(false);
  const [bairrosData, setBairrosData] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(11);

  // Filtros de tipos de ocorrência
  const [filtros, setFiltros] = useState({
    roubos: true,
    furtos: true,
    estupro: true,
    policialMorto: true,
  });

  // Função para alterar estado dos filtros
  const handleFiltroChange = (tipo) => {
    setFiltros((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  // Função de logout + redirecionamento
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para deletar uma ocorrência
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
      setOcorrencias((prev) => prev.filter((o) => o._id !== id)); // Remove do estado
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar ocorrência');
    }
  };

  // Filtra as ocorrências de acordo com os filtros selecionados
  const ocorrenciasFiltradas = ocorrencias.filter((o) => {
    const tipo = o.tipo.toLowerCase();
    return (
      (tipo.includes('roubo') && filtros.roubos) ||
      (tipo.includes('furto') && filtros.furtos) ||
      (tipo.includes('estupro') && filtros.estupro) ||
      (tipo.includes('policial') && tipo.includes('morto') && filtros.policialMorto)
    );
  });

  // Calcula a densidade de ocorrências por bairro (com memoização)
  const densidadePorBairro = useMemo(() => {
    return calcularDensidade(ocorrenciasFiltradas, populacao);
  }, [ocorrenciasFiltradas]);

  // Carrega os limites de municípios ao ativar o switch
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

  // Carrega os dados dos bairros ao iniciar o componente
  useEffect(() => {
    fetch('/BAIRROS_BS.geojson')
      .then((r) => r.json())
      .then(setBairrosData)
      .catch((err) => console.error('Erro bairros', err));
  }, []);

  // Carrega as ocorrências da API ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/ocorrencias', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOcorrencias)
      .catch((err) => console.error('Erro ocorrências:', err));
  }, []);

  // Adiciona legenda de densidade ao mapa
  useEffect(() => {
    if (!mapRef.current) return;
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
    legend.addTo(mapRef.current); // Adiciona legenda
    return () => legend.remove(); // Remove ao desmontar ou atualizar
  }, [densidadePorBairro]);

  // Estilo dos bairros com base na densidade
  const styleBairros = (feature) => {
    const bairro = feature.properties.nome;
    const municipio = feature.properties.municipio;
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

  // Define o tamanho dos círculos das ocorrências com base no zoom
  const getCircleRadius = (zoom) => {
    const baseRadius = 8;
    const zoomFactor = Math.max(1, zoom - ZOOM_THRESHOLD + 1);
    return Math.min(35, baseRadius + zoomFactor * 6);
  };

  // Renderiza cada ocorrência no mapa (Marker ou CircleMarker dependendo do zoom)
  const renderOcorrencia = (oc) => {
    const popupContent = (
      <div>
        <strong>{oc.tipo}</strong><br />
        {oc.bairro}, {oc.municipio}<br />
        {new Date(oc.data).toLocaleDateString()}<br />
        {oc.descricao}<br /><br />
        <button onClick={() => deletarOcorrencia(oc._id)} style={{ color: 'red' }}>Remover</button>
      </div>
    );

    if (zoomLevel >= ZOOM_THRESHOLD) {
      return (
        <CircleMarker
          key={oc._id}
          center={[oc.coordenadas.lat, oc.coordenadas.lon]}
          radius={getCircleRadius(zoomLevel)}
          pathOptions={{
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.6,
            weight: 1,
          }}
        >
          <Popup>{popupContent}</Popup>
        </CircleMarker>
      );
    }

    return (
      <Marker
        key={oc._id}
        position={[oc.coordenadas.lat, oc.coordenadas.lon]}
        icon={redIcon}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
    );
  };

  // Retorno JSX da tela
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
        {/* Painel lateral */}
        <Box className="form-container" sx={{ width: 300, overflowY: 'auto', p: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Limites Geograficos</Typography></AccordionSummary>
            <AccordionDetails>
              <FormControlLabel control={<Switch checked={showMunicipios} onChange={() => setShowMunicipios(!showMunicipios)} />} label="Municípios" />
              <FormControlLabel control={<Switch checked={showBairros} onChange={() => setShowBairros(!showBairros)} />} label="Bairros" />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Tipos de Ocorrencias</Typography></AccordionSummary>
            <AccordionDetails>
              {['Roubos', 'Furtos','Policial Morto em Serviço'].map((tipo) => (
                <FormControlLabel key={tipo} control={<Switch checked={filtros[tipo]} onChange={() => handleFiltroChange(tipo)} />} label={tipo} />
              ))}
            </AccordionDetails>
          </Accordion>

          <Box>
            <Typography>Total: {ocorrencias.length}</Typography>
            <Typography>Exibidas: {ocorrenciasFiltradas.length}</Typography>
          </Box>
        </Box>

        {/* Área do mapa */}
        <Box className="map-container" sx={{ flexGrow: 1, height: '100%' }}>
          <SearchBar onSelect={(lat, lon) => mapRef.current?.setView([lat, lon], 15)} />

          <MapContainer
            center={[-23.9608, -46.3336]}
            zoom={11}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => (mapRef.current = map)} // Guarda a referência do mapa
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomController setZoomLevel={setZoomLevel} />
            <GeocoderControl />

            {/* Camada de municípios */}
            {showMunicipios && municipiosData && (
              <GeoJSON data={municipiosData} style={{ fillColor: '#3388ff', weight: 2, color: 'white', fillOpacity: 0.3 }} />
            )}
            {/* Camada de bairros com estilo por densidade */}
            {showBairros && bairrosData && (
              <GeoJSON data={bairrosData} style={styleBairros} />
            )}
            {/* Renderização das ocorrências filtradas */}
            {ocorrenciasFiltradas
              .filter((o) => o.coordenadas?.lat && o.coordenadas?.lon)
              .map((oc) => renderOcorrencia(oc))}
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
}
