const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const hash = await bcrypt.hash(senha, 10);
    const novoUsuario = new User({ nome, email, senha: hash });
    await novoUsuario.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(400).json({ error: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(senha, usuario.senha);
    if (!isMatch) return res.status(401).json({ error: 'Senha inválida' });

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, role: usuario.role },
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '1h' }
    );

    res.json({ token, usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role } });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Verificar Token
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'segredo123', (err, decoded) => {
    if (err) {
      return res.status(401).json({ isValid: false, message: 'Token inválido ou expirado' });
    }
    res.json({ isValid: true, user: decoded });
  });
});

module.exports = router;
