import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logoCrimWatch from '../../assets/logoCrimWatch.png';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const customIcon = L.icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ff0000"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const municipiosBaixadaSantista = ["Santos", "São Vicente", "Guarujá", "Cubatão", "Praia Grande", "Bertioga", "Mongaguá", "Itanhaém", "Peruíbe"];
const tiposDeCrime = ["Roubo", "Furto", "Tráfico de drogas", "Violência doméstica", "Homicídio", "Outros"];

const bairrosPorMunicipio = {
  "Santos": ["José Menino", "Gonzaga", "Boqueirão", "Embaré", "Aparecida", "Ponta da Praia", "Estuário", "Macuco", "Encruzilhada", "Campo Grande", "Marapé", "Jabaquara", "Vila Belmiro", "Vila Matias", "Vila Nova", "Paquetá", "Centro", "Valongo", "Monte Serrat", "Saboó", "Alemoa", "Chico de Paula", "São Manoel", "Caneleira", "Santa Maria", "Bom Retiro", "São Jorge", "Areia Branca", "Castelo", "Rádio Clube", "Porto Valongo", "Porto Paquetá", "Outeirinho", "Piratininga", "Morro Fontana", "Morro São Bento", "Morro Pacheco", "Porto Saboó", "Morro Jabaquara", "Vila Progresso", "Morro Saboó", "Morro Penha", "Morro Marapé", "Morro Nova Cintra", "Morro Caneleira", "Morro Santa Maria", "Morro Chico de Paula", "Porto Alamoa", "Porto Macuco", "Pompéia", "Morro Santa Terezinha", "Morro José Menino", "Morro Embaré", "Morro Cachoeira", "Porto Ponta da Praia", "Guarapá", "Monte Cabrão", "Trindade", "Cabuçu", "Iriri", "Caruara", "Quilombo", "Nossa Senhora das Neves", "Ilha Barnabé", "Vila Haddad", "Chinês", "Ilhéu Alto", "Vila Hayden", "Piaçaguera", "Bagres"],
  "São Vicente": ["Centro", "Gonzaguinha", "Boa Vista", "Itararé", "Vila Valença", "Jardim Independência", "Vila São Jorge", "Jardim Guassu", "Vila Melo", "Catiapoã", "Jóckey Club", "Parque São Vicente", "Vila Nossa Senhora de Fátima", "Cidade Náutica", "Beira Mar", "Esplanada dos Barreiros", "Vila Margarida", "Parque Bitaru", "Japuí", "Humaitá", "Parque Continental", "Jardim Rio Branco", "Parque das Bandeiras", "Nova São Vicente", "Vila Ema", "Samarita", "Vila Nova Mariana", "Vila Voturuá", "Jardim Irmã Dolores"],
  "Guarujá": ["Acapulco", "Astúrias", "Barra Grande", "Boa Esperança", "Bocaina", "Cachoeira", "Cidade Atlântica", "Conceiçãozinha", "Enseada", "Guaiúba", "Guararu", "Helena Maria", "Itapema", "Jardim Progresso", "Las Palmas", "Mar e Céu", "Marinas", "Morrinhos", "Pae Cará", "Parque Estuário", "Pedreira", "Pernambuco", "Perequê", "Porto de Guarujá", "Retroporto", "Santa Cruz dos Navegantes", "Santa Maria", "Santa Rosa", "Saco do Funil", "Santo Amaro", "Santo Antônio", "Tombo", "Vargem Grande", "Vila Áurea", "Vila Ligya", "Vila Zilda"],
  "Cubatão": ["Areais", "Caminho do Mar", "Centro", "Cota 200", "Cruzeiro Quinhentista", "Guará-Vermelho", "Ilha Caraguatá", "Ilha do Tatu", "Ilha Nhapium", "Ilha Pompeva", "Itutinga-Pilões", "Jardim Anchieta", "Jardim Casqueiro", "Jardim Nova República", "Jardim São Francisco", "Marzagão", "Mãe Maria", "Paranhos", "Parque Cotia-Pará", "Parque Perequê", "Parque São Luis", "Perequê", "Piaçaguera", "Pinhal do Miranda", "Raiz da Serra", "Santa Rosa", "Serra do Mogi", "Serra do Morrão", "Serra Pilões-Zanzalá", "Sítio Cafezal", "Vale Verde", "Vila Couto", "Vila dos Pescadores", "Vila Elizabeth", "Vila Esperança", "Vila Fabril", "Vila Light", "Vila Natal", "Vila Nova", "Vila São José"],
  "Praia Grande": ["Andaraguá", "Anhanguera", "Antártica", "Aviação", "Boqueirão", "Caiçara", "Canto do Forte", "Cidade da Criança", "Esmeralda", "Flórida", "Glória", "Guilhermina", "Imperador", "Maracanã", "Melvi", "Militar", "Mirim", "Nova Mirim", "Ocian", "Princesa", "Quietude", "Real", "Ribeirópolis", "Samambaia", "Santa Marina", "Serra do Mar", "Sítio do Campo", "Solemar", "Tupi", "Tupiry", "Vila Sônia", "Xixová"],
  "Bertioga": ["Bairro Chácaras", "Boracéia", "Buriqui Costa Nativa", "Centro", "Costa do Sol", "Guaratuba", "Indaiá", "Jardim Albatroz", "Jardim Rafael", "Jardim Vicente de Carvalho", "Maitinga", "Morada da Praia", "Rio da Praia", "Riviera", "São Lourenço", "Vista Linda"],
  "Mongaguá": ["Agenor de Campos", "Centro", "Flórida Mirim", "Itaguaí", "Itaóca", "Jardim Praia Grande", "Jussara", "Pedreira", "Plataforma", "Vera Cruz", "Vila Atlântica", "Vila São Paulo"],
  "Itanhaém": ["Aguapeú", "Araraú", "Baixio", "Belas Artes", "Bopiranga", "Campos Eliseos", "Centro", "Cibratel - Chacaras", "Cibratel I", "Cibratel II", "Cidade Anchieta", "Gaivota - Interior", "Gaivota - Praia", "Guapiranga", "Guarau", "Guarda Civil", "Ivoty", "Jamaica - Interior", "Jamaica - Praia", "Jardim Anchieta", "Jardim Coronel", "Jardim Suarão - Interior", "Jardim Suarão - Praia", "Laranjeiras", "Mosteiro", "Nossa Senhora do Sion", "Nova Itanhaém - Interior", "Nova Itanhaém - Praia", "Oasis", "Praia dos Sonhos", "Raminho", "Rio Acima", "Sabaúna", "São Fernando", "Satelite", "Savoy", "Suarão", "Tropical", "Tupy", "Umuarama", "Verde Mar", "Vila São Paulo"],
  "Peruíbe": ["Centro", "Guaraú", "Jardim Márcia", "Vila São João", "Santa Helena", "Loteamento Alvorada", "Jardim das Palmeiras", "Jardim América", "Vila Presidente", "Jardim Maré", "Vila Brasil", "Jardim Santista", "Vila Bela", "Vila São Fernando", "Jardim São José", "Jardim Santista", "Vila Rural", "Caiçara", "Parque São José", "São Paulo", "Vila Beira Mar"],
};

const coordenadasMunicipios = {
  "Santos": [-23.9608, -46.3336],
  "São Vicente": [-23.9577, -46.3889],
  "Guarujá": [-23.9888, -46.2581],
  "Cubatão": [-23.8952, -46.4253],
  "Praia Grande": [-24.0084, -46.4129],
  "Bertioga": [-23.8546, -46.1397],
  "Mongaguá": [-24.0870, -46.6208],
  "Itanhaém": [-24.1833, -46.7889],
  "Peruíbe": [-24.3209, -46.9997]
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function ZoomController({ onZoomChange, currentZoom }) {
  const map = useMap();

  useMapEvents({
    zoom: () => {
      const zoom = map.getZoom();
      onZoomChange(zoom);
    },
    zoomend: () => {
      const zoom = map.getZoom();
      onZoomChange(zoom);
    }
  });

  return null;
}

function CircleRenderer({ shouldShow, markers, circleRadius }) {
  if (!shouldShow) return null;

  return (
    <>
      {markers.map((marker, index) => (
        <Circle
          key={`circle-${index}`}
          center={marker.position}
          radius={circleRadius}
          color="red"
          fillColor="#f03"
          fillOpacity={0.3}
          weight={2}
        />
      ))}
    </>
  );
}

function Home() {
  const [formData, setFormData] = useState({
    municipio: "",
    bairro: "",
    nomeRua: "",
    numero: "",
    tipoCrime: "",
    localizacao: [-23.9608, -46.3336],
    descricao: ""
  });

  const [ocorrencias, setOcorrencias] = useState([
    {
      id: 1,
      municipio: "Santos",
      bairro: "Gonzaga",
      nomeRua: "Rua Euclides da Cunha",
      numero: "123",
      tipoCrime: "Roubo",
      localizacao: [-23.9635, -46.3342],
      descricao: "Roubo de celular próximo à praça",
      data: "2023-05-10"
    },
    {
      id: 2,
      municipio: "São Vicente",
      bairro: "Centro",
      nomeRua: "Praça Vinte e Dois de Janeiro",
      numero: "",
      tipoCrime: "Furto",
      localizacao: [-23.9577, -46.3889],
      descricao: "Furto de bolsa no terminal de ônibus",
      data: "2023-05-12"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filtro, setFiltro] = useState({
    municipio: "",
    tipoCrime: ""
  });

  const [currentZoom, setCurrentZoom] = useState(13);
  const [circleRadius, setCircleRadius] = useState(70);
  const mapRef = useRef();

  const debouncedRua = useDebounce(formData.nomeRua, 1000);
  const debouncedNumero = useDebounce(formData.numero, 800);

  const MIN_ZOOM_FOR_CIRCLES = 14;

  // Novo estado para sugestões de endereço
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Novo estado para armazenar informações do endereço pesquisado
  const [searchAddress, setSearchAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    fullAddress: ""
  });

  // 1. Função fetchSuggestions melhorada para buscar endereços com número específico
  const fetchSuggestions = async (query) => {
    setIsLoading(true);
    try {
      // Padrões de reconhecimento de endereço brasileiro
      const patterns = [
        /^(.+?),\s*(\d+)(?:\s*[-–]\s*(.+))?$/, // "Rua Nome, 123 - Bairro"
        /^(.+?)\s+(\d+)(?:\s*[-–]\s*(.+))?$/, // "Rua Nome 123 - Bairro"
        /^(.+?),\s*(\d+)\s*,?\s*(.+)$/, // "Rua Nome, 123, Bairro"
      ];

      let parsedAddress = null;

      // Tentar extrair componentes do endereço
      for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match) {
          parsedAddress = {
            street: match[1]?.trim(),
            number: match[2],
            neighborhood: match[3]?.trim()
          };
          break;
        }
      }

      // Se não conseguiu extrair, usar query original
      if (!parsedAddress) {
        parsedAddress = {
          street: query.trim(),
          number: null,
          neighborhood: null
        };
      }

      const searchQueries = [];

      if (parsedAddress.number) {
        // Query 1: Endereço completo com número específico
        const fullAddress = [
          parsedAddress.street,
          parsedAddress.number,
          parsedAddress.neighborhood,
          "Baixada Santista",
          "Brasil"
        ].filter(Boolean).join(", ");

        searchQueries.push({
          query: fullAddress,
          priority: 1,
          type: 'exact_with_number'
        });

        // Query 2: Rua + número sem bairro específico
        searchQueries.push({
          query: `${parsedAddress.street} ${parsedAddress.number}, Baixada Santista, Brasil`,
          priority: 2,
          type: 'street_with_number'
        });

        // Query 3: Busca por rua para casos onde número não existe
        searchQueries.push({
          query: `${parsedAddress.street}, ${parsedAddress.neighborhood || ''}, Baixada Santista, Brasil`.replace(', ,', ','),
          priority: 3,
          type: 'street_only'
        });
      } else {
        // Query para busca sem número
        searchQueries.push({
          query: `${parsedAddress.street}, Baixada Santista, Brasil`,
          priority: 1,
          type: 'general'
        });
      }

      let allSuggestions = [];

      // Executar buscas em paralelo
      const searchPromises = searchQueries.map(async ({ query, priority, type }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=br&bounded=1&viewbox=-47.5,-22.5,-44.5,-25.5`
          );

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();

          return data.map(item => ({
            id: item.place_id,
            display_name: item.display_name,
            formatted_address: formatAddressWithNumber(item, parsedAddress.number),
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
            address: item.address,
            priority,
            search_type: type,
            exact_number_match: item.address?.house_number === parsedAddress.number,
            requested_number: parsedAddress.number,
            has_number: !!item.address?.house_number
          }));
        } catch (err) {
          console.warn(`Erro na busca: ${query}`, err);
          return [];
        }
      });

      const results = await Promise.all(searchPromises);
      allSuggestions = results.flat();

      // Remover duplicatas e ordenar por relevância
      const uniqueSuggestions = removeDuplicatesAndSort(allSuggestions, parsedAddress.number);

      setSuggestions(uniqueSuggestions.slice(0, 10));
      setShowSuggestions(true);
      setSelectedIndex(-1);

    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Função para formatar endereço com número
  const formatAddressWithNumber = (item, requestedNumber) => {
    const address = item.address || {};
    const parts = [];

    // Construir endereço priorizando número solicitado
    if (address.road) {
      if (address.house_number) {
        parts.push(`${address.road}, ${address.house_number}`);
      } else if (requestedNumber) {
        // Mostrar número solicitado mesmo se não encontrado exatamente
        parts.push(`${address.road}, ${requestedNumber} (aproximado)`);
      } else {
        parts.push(address.road);
      }
    }

    // Adicionar bairro/distrito
    if (address.suburb || address.neighbourhood || address.district) {
      parts.push(address.suburb || address.neighbourhood || address.district);
    }

    // Adicionar cidade
    if (address.city || address.town || address.municipality) {
      parts.push(address.city || address.town || address.municipality);
    }

    // Adicionar estado se necessário
    if (address.state && address.state !== 'São Paulo') {
      parts.push(address.state);
    }

    return parts.join(' - ') || item.display_name.split(',').slice(0, 3).join(', ');
  };

  // 3. Função para remover duplicatas e ordenar por relevância
  const removeDuplicatesAndSort = (suggestions, requestedNumber) => {
    // Remover duplicatas baseado em coordenadas próximas e nome
    const uniqueSuggestions = suggestions.filter((item, index, self) => {
      return index === self.findIndex(t =>
        Math.abs(t.lat - item.lat) < 0.001 &&
        Math.abs(t.lon - item.lon) < 0.001 &&
        t.address?.road === item.address?.road
      );
    });

    // Ordenar por relevância
    return uniqueSuggestions.sort((a, b) => {
      // 1. Prioridade para match exato do número
      if (a.exact_number_match && !b.exact_number_match) return -1;
      if (!a.exact_number_match && b.exact_number_match) return 1;

      // 2. Prioridade para endereços que têm número vs não têm
      if (requestedNumber) {
        if (a.has_number && !b.has_number) return -1;
        if (!a.has_number && b.has_number) return 1;
      }

      // 3. Prioridade por tipo de busca
      if (a.priority !== b.priority) return a.priority - b.priority;

      // 4. Prioridade por tipo de local (building > house > way)
      const typeOrder = { building: 1, house: 2, way: 3, road: 4 };
      const aTypeOrder = typeOrder[a.type] || 5;
      const bTypeOrder = typeOrder[b.type] || 5;

      return aTypeOrder - bTypeOrder;
    });
  };

  // Debounce para evitar muitas requisições
  const debouncedSearch = (query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.length >= 3) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  // 3. Handler melhorado para mudança no input de busca
  const handleInputChangeSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Padrões mais robustos para endereços brasileiros
    const patterns = [
      /^(.+?),\s*(\d+)(?:\s*[-–]\s*(.+))?$/, // "Rua Nome, 123 - Bairro"
      /^(.+?)\s+(\d+)(?:\s*[-–]\s*(.+))?$/, // "Rua Nome 123 - Bairro"  
      /^(.+?),\s*(\d+)\s*,?\s*(.+)$/, // "Rua Nome, 123, Bairro"
      /^(.+?)\s+(\d+)\s+(.+)$/, // "Rua Nome 123 Bairro"
    ];

    let street = "", number = "", neighborhood = "";

    // Tentar extrair componentes do endereço
    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match) {
        street = match[1]?.trim() || "";
        number = match[2] || "";
        neighborhood = match[3]?.trim() || "";
        break;
      }
    }

    // Se não conseguiu extrair, assumir que é só o nome da rua
    if (!street && value) {
      street = value.trim();
    }

    setSearchAddress({
      street: street,
      number: number,
      neighborhood: neighborhood,
      fullAddress: value
    });

    debouncedSearch(value);
  };

  // 4. Handler melhorado para clique em sugestão
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.formatted_address);

    // Extrair informações detalhadas do endereço
    const addressInfo = suggestion.address || {};

    // Usar número exato se disponível, senão usar o solicitado
    const finalNumber = addressInfo.house_number || suggestion.requested_number || "";

    setSearchAddress({
      street: addressInfo.road || "",
      number: finalNumber,
      neighborhood: addressInfo.suburb || addressInfo.neighbourhood || "",
      fullAddress: suggestion.formatted_address
    });

    // Atualizar coordenadas do formulário
    setFormData(prev => ({
      ...prev,
      localizacao: [suggestion.lat, suggestion.lon],
      // Preencher campos do formulário se estiverem vazios
      nomeRua: prev.nomeRua || addressInfo.road || "",
      numero: prev.numero || finalNumber,
      bairro: prev.bairro || addressInfo.suburb || addressInfo.neighbourhood || "",
      municipio: prev.municipio || addressInfo.city || addressInfo.town || ""
    }));

    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Mover mapa para localização com zoom adequado
    if (mapRef.current) {
      // Zoom mais próximo se tiver número específico
      const zoomLevel = suggestion.exact_number_match ? 19 :
        suggestion.has_number ? 18 :
          suggestion.requested_number ? 17 : 15;

      mapRef.current.flyTo([suggestion.lat, suggestion.lon], zoomLevel, {
        duration: 1.5
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchAddress({
      street: "",
      number: "",
      neighborhood: "",
      fullAddress: ""
    });
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  const updateCircleRadius = (zoom) => {
    const radiusMap = {
      18: 20,
      17: 30,
      16: 40,
      15: 50,
      14: 60,
      13: 70,
      12: 80,
      11: 90,
      10: 100,
      9: 120,
      8: 150,
      7: 200,
      6: 250,
      5: 300,
      4: 400
    };
    setCircleRadius(radiusMap[zoom] || 70);
  };

  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
    updateCircleRadius(zoom);
  };

  const shouldShowCircles = currentZoom >= MIN_ZOOM_FOR_CIRCLES;

  const ocorrenciasFiltradas = ocorrencias.filter(oc => {
    const matchesMunicipio = !filtro.municipio || oc.municipio === filtro.municipio;
    const matchesTipoCrime = !filtro.tipoCrime || oc.tipoCrime === filtro.tipoCrime;
    return matchesMunicipio && matchesTipoCrime;
  });

  // 5. Função melhorada para buscar coordenadas do endereço do formulário
  const buscarCoordenadasEndereco = useCallback(async (nomeRua, numero, bairro, municipio) => {
    try {
      // Array de tentativas de busca, da mais específica para menos específica
      const searchAttempts = [];

      if (numero) {
        // Tentativa 1: Endereço completo com número
        searchAttempts.push(
          `${nomeRua}, ${numero}, ${bairro}, ${municipio}, Baixada Santista, Brasil`
        );

        // Tentativa 2: Endereço sem vírgula extra
        searchAttempts.push(
          `${nomeRua} ${numero}, ${bairro}, ${municipio}, Brasil`
        );

        // Tentativa 3: Apenas rua e número
        searchAttempts.push(
          `${nomeRua} ${numero}, ${municipio}, Brasil`
        );
      }

      // Tentativa 4: Endereço sem número
      searchAttempts.push(
        `${nomeRua}, ${bairro}, ${municipio}, Baixada Santista, Brasil`
      );

      // Tentativa 5: Apenas rua e município
      searchAttempts.push(
        `${nomeRua}, ${municipio}, Brasil`
      );

      // Executar tentativas sequencialmente
      for (const [index, enderecoCompleto] of searchAttempts.entries()) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=5&addressdetails=1&countrycodes=br&bounded=1&viewbox=-47.5,-22.5,-44.5,-25.5`
          );

          if (!response.ok) continue;

          const data = await response.json();

          if (data.length > 0) {
            // Procurar match exato de número se foi fornecido
            if (numero && index < 3) {
              const exactMatch = data.find(item =>
                item.address?.house_number === numero
              );

              if (exactMatch) {
                console.log(`✅ Match exato encontrado: ${enderecoCompleto}`);
                return [parseFloat(exactMatch.lat), parseFloat(exactMatch.lon)];
              }
            }

            // Usar primeiro resultado se não encontrou match exato
            const firstResult = data[0];
            console.log(`📍 Coordenadas encontradas: ${enderecoCompleto}`);
            return [parseFloat(firstResult.lat), parseFloat(firstResult.lon)];
          }
        } catch (error) {
          console.warn(`Erro na tentativa ${index + 1}:`, error);
          continue;
        }
      }

      // Se todas falharam, tentar busca por bairro/município
      console.log("⚠️ Endereço específico não encontrado, buscando por bairro...");
      return await buscarCoordenadas(municipio, bairro);

    } catch (error) {
      console.error("Erro geral na busca de coordenadas:", error);
      return await buscarCoordenadas(municipio, bairro);
    }
  }, []);

  const buscarCoordenadas = useCallback(async (municipio, bairro) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(bairro)}, ${encodeURIComponent(municipio)}, Baixada Santista, Brasil&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        return coordenadasMunicipios[municipio] || [-23.9608, -46.3336];
      }
    } catch (error) {
      console.error("Erro na busca de coordenadas:", error);
      return coordenadasMunicipios[municipio] || [-23.9608, -46.3336];
    }
  }, []);

  useEffect(() => {
    const updateCoordinates = async () => {
      if (debouncedRua && debouncedRua.length > 3 && formData.bairro && formData.municipio) {
        const coordenadas = await buscarCoordenadasEndereco(
          debouncedRua,
          debouncedNumero,
          formData.bairro,
          formData.municipio
        );
        setFormData(prev => ({
          ...prev,
          localizacao: coordenadas
        }));
      }
    };

    updateCoordinates();
  }, [debouncedRua, debouncedNumero, formData.bairro, formData.municipio, buscarCoordenadasEndereco]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === 'municipio') {
      const coordenadas = coordenadasMunicipios[value] || [-23.9608, -46.3336];
      setFormData({
        ...formData,
        [name]: value,
        bairro: "",
        nomeRua: "",
        numero: "",
        localizacao: coordenadas
      });
    } else if (name === 'bairro' && value && formData.municipio) {
      const coordenadas = await buscarCoordenadas(formData.municipio, value);
      setFormData({
        ...formData,
        [name]: value,
        nomeRua: "",
        numero: "",
        localizacao: coordenadas
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setFormData({
      ...formData,
      localizacao: [lat, lng]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let coordenadasFinais = formData.localizacao;
    if (formData.municipio && formData.bairro && formData.nomeRua) {
      coordenadasFinais = await buscarCoordenadasEndereco(formData.nomeRua, formData.numero, formData.bairro, formData.municipio);
    }

    const novaOcorrencia = {
      ...formData,
      id: Date.now(),
      localizacao: coordenadasFinais,
      data: new Date().toISOString().split('T')[0]
    };

    setOcorrencias([...ocorrencias, novaOcorrencia]);

    const enderecoCompleto = `${formData.nomeRua}${formData.numero ? `, ${formData.numero}` : ''}, ${formData.bairro}, ${formData.municipio}`;
    alert(`Ocorrência registrada em ${enderecoCompleto}!`);

    setFormData(prev => ({
      ...prev,
      localizacao: coordenadasFinais
    }));
  };

  const Navigate = useNavigate();

  const handleClick = () => {
    Navigate('/ranking');
  }

  // Cleanup do debounce no useEffect
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const allMarkers = [
    { position: formData.localizacao },
    ...ocorrenciasFiltradas.map(oc => ({ position: oc.localizacao }))
  ];

  return (
    <div className="home">
      <div className='title-container'>
        <img src={logoCrimWatch} alt="Logo CrimWatch" className='logo' />
      </div>

      <div className="search-container">
        <div className="filtros">
          <select
            value={filtro.municipio}
            onChange={(e) => setFiltro({ ...filtro, municipio: e.target.value })}
          >
            <option value="">Todos municípios</option>
            {municipiosBaixadaSantista.map(municipio => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>

          <select
            value={filtro.tipoCrime}
            onChange={(e) => setFiltro({ ...filtro, tipoCrime: e.target.value })}
          >
            <option value="">Todos tipos de crime</option>
            {tiposDeCrime.map(crime => (
              <option key={crime} value={crime}>{crime}</option>
            ))}
          </select>
        </div>

        <div className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChangeSearch}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Insira um endereço (ex: Rua XV de Novembro, 123 - Santos)"
              autoComplete="off"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="clear-button"
                aria-label="Limpar pesquisa"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown de sugestões - Componente melhorado */}
          {showSuggestions && (
            <div className="suggestions-dropdown">
              {isLoading && (
                <div className="loading-state">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    Buscando endereços específicos...
                  </div>
                </div>
              )}

              {!isLoading && suggestions.length === 0 && searchQuery.length >= 3 && (
                <div className="no-results">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  {`Nenhum endereço encontrado para "${searchQuery}"`}
                </div>
              )}

              {!isLoading && suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''} ${suggestion.exact_number_match ? 'exact-match' :
                      suggestion.has_number ? 'has-number' : ''
                    }`}
                >
                  <div className="suggestion-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>

                  <div className="suggestion-content">
                    <div className="suggestion-address">
                      {suggestion.formatted_address}

                      {/* Badges informativos */}
                      {suggestion.exact_number_match && (
                        <span className="badge exact-match-badge">
                          📍 Número Exato
                        </span>
                      )}

                      {!suggestion.exact_number_match && suggestion.has_number && (
                        <span className="badge has-number-badge">
                          🏠 Numeração Próxima
                        </span>
                      )}

                      {suggestion.requested_number && !suggestion.has_number && (
                        <span className="badge approximate-badge">
                          📍 Aproximado
                        </span>
                      )}
                    </div>

                    <div className="suggestion-details">
                      <span className="suggestion-type">
                        {suggestion.type === 'building' && '🏢 Edifício'}
                        {suggestion.type === 'house' && '🏠 Casa'}
                        {suggestion.type === 'way' && '🛣️ Via'}
                        {suggestion.type === 'road' && '🛤️ Rua'}
                        {!['building', 'house', 'way', 'road'].includes(suggestion.type) && '📍 Local'}
                      </span>

                      {suggestion.address?.postcode && (
                        <span className="postcode">
                          CEP: {suggestion.address.postcode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="suggestion-action">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="map-container">
          <MapContainer
            center={formData.localizacao}
            zoom={currentZoom}
            style={{ height: '100%', width: '100%' }}
            onClick={handleMapClick}
            ref={mapRef}
          >
            <ZoomController onZoomChange={handleZoomChange} currentZoom={currentZoom} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <Marker position={formData.localizacao} icon={customIcon}>
              <Popup>
                <strong>Nova Ocorrência</strong><br />
                {formData.nomeRua && `${formData.nomeRua}${formData.numero ? `, ${formData.numero}` : ''}`}
                {formData.nomeRua && <br />}
                {formData.bairro || "Selecione um bairro"}, {formData.municipio || "Selecione um município"}
              </Popup>
            </Marker>

            {ocorrenciasFiltradas.map(ocorrencia => (
              <Marker key={ocorrencia.id} position={ocorrencia.localizacao} icon={customIcon}>
                <Popup>
                  <strong>{ocorrencia.tipoCrime}</strong><br />
                  {ocorrencia.nomeRua && `${ocorrencia.nomeRua}${ocorrencia.numero ? `, ${ocorrencia.numero}` : ''}`}
                  {ocorrencia.nomeRua && <br />}
                  {ocorrencia.bairro}, {ocorrencia.municipio}<br />
                  <em>{ocorrencia.descricao}</em><br />
                  <small>Registrado em: {ocorrencia.data}</small>
                </Popup>
              </Marker>
            ))}

            <CircleRenderer
              shouldShow={shouldShowCircles}
              markers={allMarkers}
              circleRadius={circleRadius}
            />
          </MapContainer>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Município</label>
              <select
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione...</option>
                {municipiosBaixadaSantista.map(municipio => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Bairro</label>
              <select
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                required
                disabled={!formData.municipio}
              >
                <option value="">{formData.municipio ? "Selecione..." : "Selecione o município primeiro"}</option>
                {formData.municipio &&
                  bairrosPorMunicipio[formData.municipio].map(bairro => (
                    <option key={bairro} value={bairro}>{bairro}</option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Nome da Rua</label>
              <input
                type="text"
                name="nomeRua"
                value={formData.nomeRua}
                onChange={handleInputChange}
                placeholder="Ex: Rua XV de Novembro"
                required
                disabled={!formData.bairro}
              />
            </div>

            <div className="form-group">
              <label>Número (opcional)</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Ex: 123"
                disabled={!formData.nomeRua}
              />
            </div>

            <div className="form-group">
              <label>Tipo de Crime</label>
              <select
                name="tipoCrime"
                value={formData.tipoCrime}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione...</option>
                {tiposDeCrime.map(crime => (
                  <option key={crime} value={crime}>{crime}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea className='form-group-description'
                placeholder="Descreva a ocorrência"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>

            <div className="form-actions">
              {/* Botões principais */}
              <div className="primary-buttons">
                <button type="submit" className="btn-primary btn-submit">
                  Registrar Ocorrência
                </button>
                <button type="submit" onClick={handleClick} className="btn-secondary btn-ranking">
                  Ranking de Crimes
                </button>
              </div>

              {/* Botão secundário */}
              <div className="secondary-actions">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() =>
                    setFormData({
                      municipio: "",
                      bairro: "",
                      nomeRua: "",
                      numero: "",
                      tipoCrime: "",
                      localizacao: [-23.9608, -46.3336],
                      descricao: ""
                    })
                  }
                >
                  ↻ Limpar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;