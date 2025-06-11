const mongoose = require('mongoose');

const bairroSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  geometria: {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true },
  },
  municipio: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipio' },
}, { timestamps: true });

bairroSchema.index({ geometria: '2dsphere' });

module.exports = mongoose.model('Bairro', bairroSchema);
