import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./MapPage.css"; // Arquivo CSS separado para estilos

const MapPage = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [exibirBairros, setExibirBairros] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [geojsonBairros, setGeojsonBairros] = useState(null);

  useEffect(() => {
    axios.get("/api/ocorrencias")
      .then((res) => {
        setOcorrencias(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErro(true);
        setLoading(false);
      });

    // Carregar GeoJSON dos bairros
    axios.get("/bairros.geojson") // ajuste para o nome real do seu arquivo GeoJSON
      .then((res) => setGeojsonBairros(res.data))
      .catch((err) => console.error("Erro ao carregar GeoJSON", err));
  }, []);

  const estiloBairro = (feature) => ({
    color: "#666",
    weight: 1,
    fillOpacity: 0.4,
    fillColor: "#00BFFF",
  });

  const ocorrenciasFiltradas = tipoFiltro
    ? ocorrencias.filter((o) => o.tipo === tipoFiltro)
    : ocorrencias;

  return (
    <div className="map-container">
      <aside className="sidebar">
        <h2>Filtros</h2>

        <label>Tipo de crime:</label>
        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          <option value="">Todos</option>
          <option value="roubo">Roubo</option>
          <option value="furto">Furto</option>
          <option value="assalto">Assalto</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={exibirBairros}
            onChange={() => setExibirBairros(!exibirBairros)}
          />
          Exibir bairros
        </label>
      </aside>

      <main className="map-main">
        {loading && <p>Carregando dados...</p>}
        {erro && <p>Erro ao carregar dados.</p>}

        <MapContainer center={[-24.0087, -46.4124]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {ocorrenciasFiltradas.map((oc, index) => (
            <Marker key={index} position={[oc.latitude, oc.longitude]}>
              <Popup>
                <strong>{oc.tipo}</strong><br />
                {oc.descricao}<br />
                {oc.bairro} - {oc.municipio}
              </Popup>
            </Marker>
          ))}

          {exibirBairros && geojsonBairros && (
            <GeoJSON data={geojsonBairros} style={estiloBairro} />
          )}
        </MapContainer>
      </main>
    </div>
  );
};

export default MapPage;
