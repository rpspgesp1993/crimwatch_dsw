const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  console.log('📝 Tentativa de registro:', req.body);

  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ Email já existe:', email);
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    console.log('🔐 Senha hasheada com sucesso');

    const newUser = new User({
      nome,
      email: email.toLowerCase(),
      senha: hashedPassword
    });

    await newUser.save();
    console.log('✅ Usuário registrado:', newUser._id);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
  } catch (err) {
    console.error('❌ Erro no registro:', err);
    res.status(500).json({ message: 'Erro no servidor. Tente novamente.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('🔑 Tentativa de login para:', req.body.email);

  const { email, senha } = req.body;

  if (!email || !senha) {
    console.log('❌ Email ou senha não fornecidos');
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    console.log('🔍 Buscando usuário...');
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    console.log('✅ Usuário encontrado:', user._id);
    console.log('🔐 Comparando senhas...');

    const isMatch = await bcrypt.compare(senha, user.senha);
    console.log('🔍 Senha confere:', isMatch);

    if (!isMatch) {
      console.log('❌ Senha incorreta');
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Verifica JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET não definido!');
      return res.status(500).json({ message: 'Erro de configuração do servidor.' });
    }

    console.log('🎟️ Gerando token...');
    const token = jwt.sign(
      { userId: user._id, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    console.log('✅ Login realizado com sucesso!');

    res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ message: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;