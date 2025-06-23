// Crie um arquivo chamado seedAdmin.js para rodar uma vez só
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/seubanco'); // ajuste o banco

async function createAdmin() {
  const existing = await User.findOne({ email: 'root@root.com' });
  if (!existing) {
    const admin = new User({
      nome: 'Administrador',
      email: 'root@root.com',
      senha: 'root', // será criptografada
      isAdmin: true,
    });
    await admin.save();
    console.log('Admin criado');
  } else {
    console.log('Admin já existe');
  }

  mongoose.disconnect();
}

createAdmin();
