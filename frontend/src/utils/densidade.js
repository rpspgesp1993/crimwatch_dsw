const normalize = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';

export const calcularDensidade = (ocorrencias, populacao) => {
  const densidadePorBairro = {};

  ocorrencias.forEach((ocorrencia) => {
    const municipio = normalize(ocorrencia.municipio);
    const bairro = normalize(ocorrencia.bairro);
    const chave = `${municipio}::${bairro}`;

    if (!densidadePorBairro[chave]) {
      densidadePorBairro[chave] = 0;
    }
    densidadePorBairro[chave]++;
  });

  return densidadePorBairro;
};
