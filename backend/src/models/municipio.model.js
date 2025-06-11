const mongoose = require('mongoose');

const municipioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  regiao: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Municipio', municipioSchema);
