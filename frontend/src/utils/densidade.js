// src/utils/densidade.js
export function calcularDensidade(ocorrencias, populacao) {
  const contagem = {};

  ocorrencias.forEach(o => {
    const chave = `${o.municipio}::${o.bairro}`;
    contagem[chave] = (contagem[chave] || 0) + 1;
  });

  const densidade = {};
  for (const chave in contagem) {
    const [municipio, bairro] = chave.split('::');
    const habitantes = populacao[municipio]?.[bairro];
    if (habitantes && habitantes > 0) {
      densidade[chave] = (contagem[chave] / habitantes) * 100000;
    }
  }

  return densidade;
}
