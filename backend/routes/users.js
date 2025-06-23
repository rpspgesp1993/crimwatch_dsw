const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Registro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const user = await User.create({ nome, email, senha });
    const token = generateToken(user._id, user.role);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.validarSenha(senha)))
    return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = generateToken(user._id, user.role);
  res.json({ user, token });
});

// Listar todos (apenas admin)
const authMiddleware = require('../middlewares/authMiddleware');
router.get('/', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin')
    return res.status(403).json({ error: 'Acesso restrito' });

  const users = await User.find();
  res.json(users);
});

module.exports = router;
