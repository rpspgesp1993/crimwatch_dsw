const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function criarUsuario() {
  await mongoose.connect(process.env.MONGO_URI);

  const novoUsuario = new User({
    nome: 'teste',
    email: 'teste@teste.com',
    senha: '12345678'
  });

  await novoUsuario.save();
  console.log('✅ Usuário criado com sucesso');

  mongoose.disconnect();
}

criarUsuario().catch(console.error);
