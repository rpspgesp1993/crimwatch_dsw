const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
  papel: { type: String, enum: ['publico', 'pesquisador', 'autoridade'], default: 'publico' },
}, { timestamps: true });

usuarioSchema.pre('save', async function (next) {
  if (this.isModified('senha')) {
    this.senha = await bcrypt.hash(this.senha, 10);
  }
  next();
});

usuarioSchema.methods.validarSenha = function (senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
