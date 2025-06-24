const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
require('dotenv').config();

async function criarUsuario() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crimwatch');

    const nome = 'teste';
    const email = 'teste@teste.com';
    const senhaPlana = '12345678';

    const senhaCriptografada = await bcrypt.hash(senhaPlana, 10);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaCriptografada,
      role: 'user'
    });

    await novoUsuario.save();

    console.log('✅ Usuário criado com sucesso!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${senhaPlana}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao criar usuário:', err);
    process.exit(1);
  }
}

criarUsuario();
