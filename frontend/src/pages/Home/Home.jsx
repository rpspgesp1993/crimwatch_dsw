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
  "Cubatão": ["Areais", "Caminho do Mar", "Centro", "Cota 200", "Cruzeiro Quinhentista", "Guará-Vermelho", "Ilha Caraguatá", "Ilha do Tatu", "Ilha Nhapium", "Ilha Pompeva", "Itutinga-Pilões", "Jardim Anchieta", "Jardim Casqueiro", "Jardim Nova República", "Jardim São Francisco", "Marzagão", "Mãe Maria", "Paranhos", "Parque Cotia-Pará", "Parque Perequê", "Parque São Luis", "Perequê", "Piaçaguera", "Pinhal do Miranda", "Raiz da Serra", "Santa Rosa", "Serra do Mogi", "Serra do Morrão", "Serra do Poço do Meio", "Serra Pilões-Zanzalá", "Sítio Cafezal", "Vale Verde", "Vila Couto", "Vila dos Pescadores", "Vila Elizabeth", "Vila Esperança", "Vila Fabril", "Vila Light", "Vila Natal", "Vila Nova", "Vila São José"],
  "Praia Grande": ["Andaraguá", "Anhanguera", "Antártica", "Aviação", "Boqueirão", "Caiçara", "Canto do Forte", "Cidade da Criança", "Esmeralda", "Flórida", "Glória", "Guilhermina", "Imperador", "Maracanã", "Melvi", "Militar", "Mirim", "Nova Mirim", "Ocian", "Princesa", "Quietude", "Real", "Ribeirópolis", "Samambaia", "Santa Marina", "Serra do Mar", "Sítio do Campo", "Solemar", "Tupi", "Tupiry", "Vila Sônia", "Xixová"],
  "Bertioga": ["Bairro Chácaras", "Boracéia", "Buriqui Costa Nativa", "Centro", "Costa do Sol", "Guaratuba", "Indaiá", "Jardim Albatroz", "Jardim Rafael", "Jardim Vicente de Carvalho", "Maitinga", "Morada da Praia", "Rio da Praia", "Riviera", "São Lourenço", "Vista Linda"],
  "Mongaguá": ["Agenor de Campos", "Centro", "Flórida Mirim", "Itaguaí", "Itaóca", "Jardim Praia Grande", "Jussara", "Pedreira", "Plataforma", "Vera Cruz", "Vila Atlântica", "Vila São Paulo"],
  "Itanhaém": ["Aguapeú", "Araraú", "Baixio", "Belas Artes", "Bopiranga", "Campos Eliseos", "Centro", "Cibratel - Chacaras", "Cibratel I", "Cibratel II", "Cidade Anchieta", "Gaivota - Interior", "Gaivota - Praia", "Guapiranga", "Guarau", "Guarda Civil", "Ivoty", "Jamaica - Interior", "Jamaica - Praia", "Jardim Anchieta", "Jardim Coronel", "Jardim Suarão - Interior", "Jardim Suarão - Praia", "Laranjeiras", "Mosteiro", "Nossa Senhora do Sion", "Nova Itanhaém - Interior", "Nova Itanhaém - Praia", "Oasis", "Praia dos Sonhos", "Raminho", "Rio Acima", "Sabaúna", "São Fernando", "Satelite", "Savoy", "Suarão", "Tropical", "Tupy", "Umuarama", "Verde Mar", "Vila São Paulo"],
  "Peruíbe": ["Centro", "Guaraú", "Jardim Márcia", "Vila São João", "Santa Helena", "Loteamento Alvorada", "Jardim das Palmeiras", "Jardim América", "Vila Presidente", "Jardim Maré", "Vila Brasil", "Jardim Santista", "Vila Bela", "Vila São Fernando", "Jardim São José", "Jardim São Vicente", "Vila Rural", "Caiçara", "Parque São José", "São Paulo", "Vila Beira Mar"],
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

  const buscarCoordenadasEndereco = useCallback(async (nomeRua, numero, bairro, municipio) => {
    try {
      const enderecoCompleto = `${nomeRua}${numero ? `, ${numero}` : ''}, ${bairro}, ${municipio}, Baixada Santista, Brasil`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        return await buscarCoordenadas(municipio, bairro);
      }
    } catch (error) {
      console.error("Erro na busca de coordenadas do endereço:", error);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}, Baixada Santista, Brasil`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        const newLocation = [parseFloat(lat), parseFloat(lon)];

        setFormData(prev => ({
          ...prev,
          localizacao: newLocation
        }));

        if (mapRef.current) {
          mapRef.current.flyTo(newLocation, 15);
        }
      } else {
        alert("Endereço não encontrado. Tente com mais detalhes (ex: Rua XV de Novembro, 123 - Santos)");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao buscar endereço. Tente novamente.");
    }
  };

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
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Insira um endereço (ex: Rua XV de Novembro, 123 - Santos)"
            />
          </form>
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

            <button type="submit" className="submit-button">
              Registrar Ocorrência
            </button>
            <button type="button" className="clear-button submit-button" onClick={() => setFormData({ municipio: "", bairro: "", nomeRua: "", numero: "", tipoCrime: "", localizacao: [-23.9608, -46.3336], descricao: "" })}>
              Limpar Formulário
            </button>
            <button type="submit" onClick={handleClick} className="ranking-button submit-button">
              Ranking de crimes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;