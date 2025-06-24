const express = require('express');
const bcrypt = require('bcrypt');  // ✅ Usando o bcrypt nativo
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ✅ Rota de Registro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  console.log('\n📥 Nova tentativa de cadastro:');
  console.log('👉 Nome:', nome);
  console.log('👉 Email:', email);
  console.log('👉 Senha:', senha);

  try {
    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();

    console.log('✅ Usuário cadastrado com sucesso!');
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error('❌ Erro ao cadastrar usuário:', err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Rota de Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  console.log('\n📥 Nova tentativa de login:');
  console.log('👉 Email recebido:', email);
  console.log('👉 Senha recebida:', senha);

  try {
    const usuario = await User.findOne({ email });
    console.log('🔎 Resultado do findOne:', usuario);

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco.');
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    console.log('🔑 Iniciando comparação de senha...');
    const isMatch = await bcrypt.compare(senha, usuario.senha);
    console.log('✅ Resultado do bcrypt.compare:', isMatch);

    if (!isMatch) {
      console.log('❌ Senha incorreta!');
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, role: usuario.role },
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '1h' }
    );

    console.log('✅ Login bem-sucedido! Token gerado:', token);

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (err) {
    console.error('❌ Erro interno ao tentar logar:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ✅ Rota de Verificação de Token
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('❌ Token não fornecido.');
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'segredo123', (err, decoded) => {
    if (err) {
      console.log('❌ Token inválido ou expirado:', err.message);
      return res.status(401).json({ isValid: false, message: 'Token inválido ou expirado' });
    }

    console.log('✅ Token válido:', decoded);
    res.json({ isValid: true, user: decoded });
  });
});

module.exports = router;
