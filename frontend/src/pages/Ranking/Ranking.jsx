import React, { useState, useMemo } from "react";
import api from "../../services/api"; // ajuste o caminho conforme seu projeto

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

  const tiposDeCrime = useMemo(() => {
    const tipos = new Set();
    (ocorrencias || []).forEach((oc) => {
      if (oc.tipo) tipos.add(oc.tipo);
    });
    return Array.from(tipos);
  }, [ocorrencias]);

  const buscarRanking = async () => {
    try {
      const params = {};
      if (municipioSelecionado) params.municipio = municipioSelecionado;
      if (tipoSelecionado && tipoSelecionado !== "todos") params.tipo = tipoSelecionado;
      if (dataInicial) params.dataInicial = dataInicial;
      if (dataFinal) params.dataFinal = dataFinal;

      const response = await api.get("/ocorrencias", { params });
      setOcorrenciasAPI(response.data);
    } catch (err) {
      console.error("Erro ao buscar ranking", err);
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

  return (
    <div>
      <h1>Ranking de Ocorrências por Bairro</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Tipo de Crime:{" "}
          <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(e.target.value)}>
            <option value="todos">Todos</option>
            {tiposDeCrime.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "2rem" }}>
          Município:{" "}
          <select value={municipioSelecionado} onChange={(e) => setMunicipioSelecionado(e.target.value)}>
            {municipios.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "2rem" }}>
          De:{" "}
          <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Até:{" "}
          <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
        </label>

        <button onClick={buscarRanking} style={{ marginLeft: "2rem" }}>
          Buscar
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Bairro</th>
            <th>Ocorrências</th>
            <th>População</th>
            <th>Taxa (por 100 mil hab.)</th>
          </tr>
        </thead>
        <tbody>
          {rankingOrdenado.map(({ bairro, total, populacao, taxa }) => (
            <tr key={bairro}>
              <td>{bairro}</td>
              <td>{total}</td>
              <td>{populacao || "Sem dado"}</td>
              <td>{taxa !== null ? taxa.toFixed(2) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ranking;
