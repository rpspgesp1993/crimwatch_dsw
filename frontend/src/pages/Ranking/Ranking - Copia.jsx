import React, { useState } from 'react';
import logoCrimWatch from '../../assets/logoCrimWatch.png';
import './Ranking.css';

function Ranking() {
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');

  const dadosRanking = [
    { posicao: 1, bairro: 'Centro', cidade: 'Santos', quantidade: 42 },
    { posicao: 2, bairro: 'Gonzaga', cidade: 'Santos', quantidade: 38 },
    { posicao: 3, bairro: 'Ponta da Praia', cidade: 'Santos', quantidade: 35 },
    { posicao: 4, bairro: 'Parque Bitaru', cidade: 'São Vicente', quantidade: 32 },
    { posicao: 5, bairro: 'Vila Nossa Sra. de Fátima', cidade: 'São Vicente', quantidade: 28 },
    { posicao: 6, bairro: 'Pitangueiras', cidade: 'Guarujá', quantidade: 25 },
    { posicao: 7, bairro: 'Enseada', cidade: 'Guarujá', quantidade: 22 },
    { posicao: 8, bairro: 'Boqueirão', cidade: 'Praia Grande', quantidade: 20 },
    { posicao: 9, bairro: 'Ocian', cidade: 'Praia Grande', quantidade: 18 },
    { posicao: 10, bairro: 'Centro', cidade: 'Cubatão', quantidade: 15 },
  ];

  const cidadesUnicas = [...new Set(dadosRanking.map(item => item.cidade))];
  const dadosFiltrados = cidadeSelecionada
    ? dadosRanking.filter(item => item.cidade === cidadeSelecionada)
    : dadosRanking;

  const mostrarCidade = !cidadeSelecionada;

  return (
    <div className='ranking'>
      <div className='ranking__header'>
        <img src={logoCrimWatch} alt="Logo" className='ranking__logo' />
        <h1 className='ranking__title'>Ranking de Ocorrências</h1>
      </div>

      <div className='ranking__filtro'>
        <select
          value={cidadeSelecionada}
          onChange={(e) => setCidadeSelecionada(e.target.value)}
          className='ranking__select'
        >
          <option value="">Todas as cidades</option>
          {cidadesUnicas.map(cidade => (
            <option key={cidade} value={cidade}>{cidade}</option>
          ))}
        </select>
      </div>

      <div className='ranking__tabela-container'>
        <table className='ranking__tabela'>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Bairro</th>
              {mostrarCidade && <th>Cidade</th>}
              <th>Ocorrências</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map(item => (
              <tr key={`${item.bairro}-${item.cidade}`}>
                <td>{item.posicao}</td>
                <td>{item.bairro}</td>
                {mostrarCidade && <td>{item.cidade}</td>}
                <td>{item.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ranking;
