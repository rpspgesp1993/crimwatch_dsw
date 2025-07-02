import React, { useState, useMemo, useEffect } from "react";
import api from "../../services/api";
import "./Ranking.css";

// Importações dos dados populacionais por município
import { populacaoBertioga } from "../../data/bertioga";
import { populacaoCubatao } from "../../data/cubatao";
import { populacaoGuaruja } from "../../data/guaruja";
import { populacaoItanhaem } from "../../data/itanhaem";
import { populacaoMongagua } from "../../data/mongagua";
import { populacaoPeruibe } from "../../data/peruibe";
import { populacaoPraiaGrande } from "../../data/praia_grande";
import { populacaoSantos } from "../../data/santos";
import { populacaoSaoVicente } from "../../data/sao_vicente";

// Consolidação de todos os dados em um único objeto
const populacaoBairros = {
  ...populacaoBertioga,
  ...populacaoCubatao,
  ...populacaoGuaruja,
  ...populacaoItanhaem,
  ...populacaoMongagua,
  ...populacaoPeruibe,
  ...populacaoPraiaGrande,
  ...populacaoSantos,
  ...populacaoSaoVicente,
};

const bairrosPorMunicipio = {
  "Peruíbe": Object.keys(populacaoPeruibe),
  "Itanhaém": Object.keys(populacaoItanhaem),
  "Mongaguá": Object.keys(populacaoMongagua),
  "Praia Grande": Object.keys(populacaoPraiaGrande),
  "São Vicente": Object.keys(populacaoSaoVicente),
  "Santos": Object.keys(populacaoSantos),
  "Cubatão": Object.keys(populacaoCubatao),
  "Guarujá": Object.keys(populacaoGuaruja),
  "Bertioga": Object.keys(populacaoBertioga),
};

const municipios = Object.keys(bairrosPorMunicipio);

const Ranking = ({ ocorrencias = [] }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState("todos");
  const [municipioSelecionado, setMunicipioSelecionado] = useState("Peruíbe");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [ocorrenciasAPI, setOcorrenciasAPI] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup para resolver problemas de navegação
  useEffect(() => {
    // Limpa qualquer timer ou referência pendente do Leaflet
    return () => {
      // Força a limpeza de qualquer mapa global que possa estar interferindo
      if (window.L && window.L._getMap) {
        try {
          const maps = window.L._getMap();
          if (maps) {
            Object.values(maps).forEach(map => {
              if (map && map.remove) {
                map.remove();
              }
            });
          }
        } catch (e) {
          // Ignora erros de limpeza
        }
      }
    };
  }, []);

  const tiposDeCrime = useMemo(() => {
    const tipos = new Set();
    (ocorrencias || []).forEach((oc) => {
      if (oc.tipo) tipos.add(oc.tipo);
    });
    return Array.from(tipos);
  }, [ocorrencias]);

  const buscarRanking = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (municipioSelecionado) params.municipio = municipioSelecionado;
      if (tipoSelecionado && tipoSelecionado !== "todos") params.tipo = tipoSelecionado;
      if (dataInicial) params.dataInicial = dataInicial;
      if (dataFinal) params.dataFinal = dataFinal;

      const response = await api.get(`${process.env.REACT_APP_API_URL}/ocorrencias`, { params });
      setOcorrenciasAPI(response.data);
    } catch (err) {
      console.error("Erro ao buscar ranking", err);
    } finally {
      setIsLoading(false);
    }
  };

  const dados = ocorrenciasAPI.length > 0 ? ocorrenciasAPI : ocorrencias;

  const ocorrenciasFiltradas = dados.filter((oc) => {
    const tipoOK = tipoSelecionado === "todos" || oc.tipo === tipoSelecionado;
    const munOK = municipioSelecionado === "todos" || oc.municipio === municipioSelecionado;
    return tipoOK && munOK;
  });

  const contagemPorBairro = ocorrenciasFiltradas.reduce((acc, oc) => {
    if (oc.bairro && oc.municipio === municipioSelecionado) {
      acc[oc.bairro] = (acc[oc.bairro] || 0) + 1;
    }
    return acc;
  }, {});

  const bairrosDoMunicipio = bairrosPorMunicipio[municipioSelecionado] || [];

  const ranking = bairrosDoMunicipio.map((bairro) => {
    const total = contagemPorBairro[bairro] || 0;
    const populacao = populacaoBairros[bairro];
    const taxa = populacao ? (total / populacao) * 100000 : null;
    return { bairro, total, populacao, taxa };
  });

  const rankingOrdenado = ranking.some((r) => r.total > 0)
    ? ranking.sort((a, b) => b.taxa - a.taxa)
    : ranking.sort((a, b) => a.bairro.localeCompare(b.bairro));

  // Função para formatar números grandes
  const formatarNumero = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="ranking-container">
      <div className="ranking-card">
        <div className="ranking-header">
          <h1 className="ranking-title">Ranking de Ocorrências</h1>
        </div>

        <div className="ranking-filters">
          <div className="filter-group">
            <label className="filter-label">
              Tipo
              <select 
                className="filter-select" 
                value={tipoSelecionado} 
                onChange={(e) => setTipoSelecionado(e.target.value)}
              >
                <option value="todos">Todos</option>
                {tiposDeCrime.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Município
              <select 
                className="filter-select" 
                value={municipioSelecionado} 
                onChange={(e) => setMunicipioSelecionado(e.target.value)}
              >
                {municipios.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Data Inicial
              <input 
                type="date" 
                className="filter-input" 
                value={dataInicial} 
                onChange={(e) => setDataInicial(e.target.value)} 
              />
            </label>

            <label className="filter-label">
              Data Final
              <input 
                type="date" 
                className="filter-input" 
                value={dataFinal} 
                onChange={(e) => setDataFinal(e.target.value)} 
              />
            </label>

            <button 
              className="search-button" 
              onClick={buscarRanking}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Buscar"}
            </button>
          </div>
        </div>

        <div className="ranking-table-container">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Bairro</th>
                <th>Ocorrências</th>
                <th>População</th>
                <th>Taxa/100k</th>
              </tr>
            </thead>
            <tbody>
              {rankingOrdenado.map(({ bairro, total, populacao, taxa }, index) => (
                <tr key={bairro} className={index < 3 ? `ranking-row-${index + 1}` : ''}>
                  <td className="bairro-cell">{bairro}</td>
                  <td className="ocorrencias-cell">{total}</td>
                  <td className="populacao-cell">
                    {populacao ? formatarNumero(populacao) : "—"}
                  </td>
                  <td className="taxa-cell">
                    {taxa !== null ? taxa.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;