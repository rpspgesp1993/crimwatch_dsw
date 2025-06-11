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
  // Obtém a instância do mapa usando o hook useMap do react-leaflet
  const map = useMap();

  // Efeito para adicionar o controle de geocodificação ao mapa
  useEffect(() => {
    // Cria uma instância do geocoder do Leaflet e adiciona ao mapa
    const geocoder = L.Control.geocoder({ defaultMarkGeocode: true }).addTo(map);

    // Função de limpeza: remove o controle quando o componente é desmontado
    return () => map.removeControl(geocoder);
  }, [map]); // Dependência: só executa quando o mapa muda

  return null; // Componente não renderiza nada, apenas adiciona funcionalidade ao mapa
};


// Componente principal da página Home
export default function Home() {
  // Ref para acessar a instância do mapa diretamente
  const mapRef = useRef(null);

  // Estados para controlar a exibição de municípios e seus dados
  const [showMunicipios, setShowMunicipios] = useState(false);
  const [municipiosData, setMunicipiosData] = useState(null);
  
  // Estados para controlar a exibição de bairros e seus dados
  const [showBairros, setShowBairros] = useState(false);
  const [bairrosData, setBairrosData] = useState(null);

  // Estado para armazenar a lista de ocorrências
  const [ocorrencias, setOcorrencias] = useState([]);

  // Estado para armazenar o usuário logado (pega do localStorage)
  const [usuario, setUsuario] = useState(localStorage.getItem('user') || null);

  // Estados para controlar o menu de login (Material UI)
  const [anchorEl, setAnchorEl] = useState(null);

  // Funções para abrir/fechar o menu de login
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Efeito para carregar os dados geográficos (municípios e bairros) ao montar o componente
  useEffect(() => {
    // Carrega dados de municípios
    fetch('/municipiosBS.geojson')
      .then(r => r.json())
      .then(setMunicipiosData)
      .catch(err => console.error('Erro municípios', err));

    // Carrega dados de bairros
    fetch('/BAIRROS_BS.geojson')
      .then(r => r.json())
      .then(setBairrosData)
      .catch(err => console.error('Erro bairros', err));
  }, []); // Array de dependências vazio = executa apenas uma vez

  // Efeito para buscar ocorrências do backend
  useEffect(() => {
    fetch('http://localhost:4000/api/ocorrencias')
      .then(r => r.json())
      .then(setOcorrencias)
      .catch(err => console.error('Erro ocorrências:', err));
  }, []); // Busca ocorrências apenas uma vez ao montar

  // Efeito para escutar mudanças no localStorage (login/logout em outra aba)
  useEffect(() => {
    const handleStorageChange = () => {
      setUsuario(localStorage.getItem('user'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Configura o listener apenas uma vez

  // Função para deletar uma ocorrência
  const deletarOcorrencia = async (id) => {
    // Confirmação antes de deletar
    if (!window.confirm('Tem certeza que deseja remover esta ocorrência?')) return;
    
    try {
      // Faz requisição DELETE para a API
      const res = await fetch(`http://localhost:4000/api/ocorrencias/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      alert(data.mensagem || 'Removida com sucesso');
      // Atualiza a lista de ocorrências removendo a deletada
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao deletar ocorrência');
    }
  };

  // Renderização do componente
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
          {/* Accordion para controles de limites geográficos */}
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

          {/* Accordion para filtros de tipos de ocorrências */}
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
          {/* Componente de barra de busca */}
          <SearchBar
            onSelect={(lat, lon) => mapRef.current && mapRef.current.setView([lat, lon], 15)}
          />

          {/* Container do mapa Leaflet */}
          <MapContainer
            center={[-23.9608, -46.3336]} // Coordenadas iniciais (Santos, SP)
            zoom={11} // Zoom inicial
            scrollWheelZoom // Habilita zoom com roda do mouse
            style={{ height: '100%', width: '100%' }}
            whenCreated={map => (mapRef.current = map)} // Callback quando o mapa é criado
          >
            {/* Camada base do mapa (OpenStreetMap) */}
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Componente de geocodificação (busca por endereço) */}
            <GeocoderControl />

            {/* Renderiza municípios se ativado e dados carregados */}
            {showMunicipios && municipiosData && (
              <GeoJSON
                data={municipiosData}
                style={{ color: '#1976d2', weight: 2, fillOpacity: 0.2 }}
                onEachFeature={(f, l) =>
                  l.bindPopup(`<strong>${f.properties?.name || f.properties?.NOME || 'Sem nome'}</strong>`)
                }
              />
            )}

            {/* Renderiza bairros se ativado e dados carregados */}
            {showBairros && bairrosData && (
              <GeoJSON
                data={bairrosData}
                style={{ color: '#d32f2f', weight: 1.5, fillOpacity: 0.15 }}
                onEachFeature={(f, l) =>
                  l.bindPopup(`<strong>${f.properties?.name || f.properties?.NOME || 'Sem nome'}</strong>`)
                }
              />
            )}

            {/* Renderiza marcadores para cada ocorrência */}
            {ocorrencias.map(oc => (
              <Marker
                key={oc._id}
                position={[oc.coordenadas.lat, oc.coordenadas.lon]}
              >
                {/* Popup com informações da ocorrência */}
                <Popup>
                  <strong>{oc.tipo}</strong><br />
                  {oc.bairro}, {oc.municipio}<br />
                  {new Date(oc.data).toLocaleDateString()}<br />
                  {oc.descricao}<br /><br />
                  {/* Botão para deletar ocorrência */}
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