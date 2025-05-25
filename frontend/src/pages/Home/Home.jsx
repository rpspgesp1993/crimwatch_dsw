import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function Home() {
  const [formData, setFormData] = useState({
    municipio: "",
    bairro: "",
    tipoCrime: "",
    localizacao: [-23.9608, -46.3336],
    descricao: ""
  });

  const [ocorrencias, setOcorrencias] = useState([
    {
      id: 1,
      municipio: "Santos",
      bairro: "Gonzaga",
      tipoCrime: "Roubo",
      localizacao: [-23.9635, -46.3342],
      descricao: "Roubo de celular próximo à praça",
      data: "2023-05-10"
    },
    {
      id: 2,
      municipio: "São Vicente",
      bairro: "Centro",
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
  const [map, setMap] = useState(null);

  const ocorrenciasFiltradas = ocorrencias.filter(oc => {
    const matchesMunicipio = !filtro.municipio || oc.municipio === filtro.municipio;
    const matchesTipoCrime = !filtro.tipoCrime || oc.tipoCrime === filtro.tipoCrime;
    return matchesMunicipio && matchesTipoCrime;
  });

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
        
        if (map) map.flyTo(newLocation, 15);
      } else {
        alert("Endereço não encontrado. Tente com mais detalhes (ex: Rua XV de Novembro, 123 - Santos)");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao buscar endereço. Tente novamente.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setFormData({
      ...formData,
      localizacao: [lat, lng]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novaOcorrencia = {
      ...formData,
      id: Date.now(),
      data: new Date().toISOString().split('T')[0]
    };
    setOcorrencias([...ocorrencias, novaOcorrencia]);
    alert(`Ocorrência registrada em ${formData.bairro}, ${formData.municipio}!`);
  };

  const Navigate = useNavigate();

  const handleClick = () => {
    Navigate('/ranking');
  }

  useEffect(() => {
    if (formData.municipio && coordenadasMunicipios[formData.municipio]) {
      setFormData(prev => ({
        ...prev,
        localizacao: coordenadasMunicipios[formData.municipio]
      }));
    }
  }, [formData.municipio]);

  return (
    <div className="home">
      <div className='title-container'>
        <img src={logoCrimWatch} alt="Logo CrimWatch" className='logo' />
      </div>
      
      <div className="search-container">
        <div className="filtros">
          <select
            value={filtro.municipio}
            onChange={(e) => setFiltro({...filtro, municipio: e.target.value})}
          >
            <option value="">Todos municípios</option>
            {municipiosBaixadaSantista.map(municipio => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>
          
          <select
            value={filtro.tipoCrime}
            onChange={(e) => setFiltro({...filtro, tipoCrime: e.target.value})}
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
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            onClick={handleMapClick}
            whenCreated={setMap}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            <Marker position={formData.localizacao} icon={customIcon}>
              <Popup>
                <strong>Nova Ocorrência</strong><br/>
                {formData.bairro || "Selecione um bairro"}, {formData.municipio || "Selecione um município"}
              </Popup>
            </Marker>
            
            {ocorrenciasFiltradas.map(ocorrencia => (
              <Marker
                key={ocorrencia.id}
                position={ocorrencia.localizacao}
                icon={customIcon}
              >
                <Popup>
                  <strong>{ocorrencia.tipoCrime}</strong><br/>
                  {ocorrencia.bairro}, {ocorrencia.municipio}<br/>
                  <em>{ocorrencia.descricao}</em><br/>
                  <small>Registrado em: {ocorrencia.data}</small>
                </Popup>
              </Marker>
            ))}
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

            <div className="form-group">
              <label>Coordenadas</label>
              <input
                type="text"
                value={`Lat: ${formData.localizacao[0].toFixed(4)}, Lng: ${formData.localizacao[1].toFixed(4)}`}
                readOnly
              />
            </div>

            <button type="submit" className="submit-button">
              Registrar Ocorrência
            </button>
            <button type="button" className="clear-button submit-button" onClick={() => setFormData({ municipio: "", bairro: "", tipoCrime: "", localizacao: [-23.9608, -46.3336], descricao: "" })}>
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