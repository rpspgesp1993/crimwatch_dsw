const mongoose = require('mongoose');

const ocorrenciaSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  data: { type: Date, required: true },
  municipio: String,
  bairro: String,
  coordenadas: {
    lat: Number,
    lon: Number
  },
  descricao: String
});

module.exports = mongoose.model('Ocorrencia', ocorrenciaSchema);
