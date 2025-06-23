import { populacaoSantos } from './santos.js';
import { populacaoSaoVicente } from './sao_vicente.js';
import { populacaoPraiaGrande } from './praia_grande.js';
import { populacaoPeruibe } from './peruibe.js';
import { populacaoMongagua } from './mongagua.js';
import { populacaoItanhaem } from './itanhaem.js';
import { populacaoGuaruja } from './guaruja.js';
import { populacaoCubatao } from './cubatao.js';
import { populacaoBertioga } from './bertioga.js';

const populacao = {
  ...populacaoSantos,
  ...populacaoSaoVicente,
  ...populacaoPraiaGrande,
  ...populacaoPeruibe,
  ...populacaoMongagua,
  ...populacaoItanhaem,
  ...populacaoGuaruja,
  ...populacaoCubatao,
  ...populacaoBertioga,
};

export default populacao;
