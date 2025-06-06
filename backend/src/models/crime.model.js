const mongoose = require('mongoose');

const crimeSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  descricao: String,
  data: { type: Date, required: true },
  local: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  bairro: { type: String },
}, {
  timestamps: true,
});

crimeSchema.index({ local: '2dsphere' });

module.exports = mongoose.model('Crime', crimeSchema);
