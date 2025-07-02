const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Middleware de autenticação (deve ser o mesmo usado no adminMiddleware)
const adminMiddleware = require('../middleware/adminMiddleware');

// Registro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const user = await User.create({ nome, email, senha });
    const token = generateToken(user._id, user.role);
    
    // Remover dados sensíveis antes de retornar
    const { senha: _, refreshToken, ...userWithoutSensitiveData } = user.toObject();
    
    res.status(201).json({ 
      user: userWithoutSensitiveData, 
      token 
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    console.log('📧 Tentativa de login para:', email);
    
    const user = await User.findOne({ email });
    if (!user || !(await user.validarSenha(senha))) {
      console.log('❌ Credenciais inválidas para:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = generateToken(user._id, user.role);
    
    // Remover dados sensíveis antes de retornar
    const { senha: _, refreshToken, ...userWithoutSensitiveData } = user.toObject();
    
    console.log('✅ Login bem-sucedido:', {
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    res.json({ 
      user: userWithoutSensitiveData, 
      token 
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos (apenas admin) - ROTA CORRIGIDA
router.get('/', adminMiddleware, async (req, res) => {
  try {
    console.log('🎯 ROTA GET /users ATIVADA');
    console.log('📋 Dados da requisição:', {
      userId: req.userId,
      userRole: req.userRole,
      userEmail: req.user?.email
    });
    
    // Verificar se o usuário é admin
    if (req.userRole !== 'admin') {
      console.log('❌ ACESSO NEGADO!');
      console.log('❌ Role encontrado:', req.userRole);
      console.log('❌ Tipo do role:', typeof req.userRole);
      console.log('❌ Role === "admin"?', req.userRole === 'admin');
      return res.status(403).json({ 
        error: 'Acesso restrito a administradores',
        debug: { userRole: req.userRole, expectedRole: 'admin' }
      });
    }
    
    console.log('✅ Usuário é admin, buscando usuários...');
    
    const users = await User.find().select('-senha -refreshToken');
    
    console.log(`✅ Retornando ${users.length} usuários`);
    res.json(users);
  } catch (err) {
    console.error('❌ Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Promover usuário a admin (apenas admin)
router.patch('/promote/:userId', adminMiddleware, async (req, res) => {
  try {
    console.log('⬆️ Tentativa de promoção:', {
      adminId: req.userId,
      adminRole: req.userRole,
      targetUserId: req.params.userId
    });

    // Verificar se o usuário logado é admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas admins podem promover usuários.' });
    }

    const { userId } = req.params;

    // Verificar se o usuário a ser promovido existe
    const userToPromote = await User.findById(userId);
    if (!userToPromote) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Verificar se o usuário já é admin
    if (userToPromote.role === 'admin') {
      return res.status(400).json({ error: 'Usuário já é administrador.' });
    }

    // Promover o usuário a admin
    userToPromote.role = 'admin';
    await userToPromote.save();

    // Retornar o usuário atualizado (sem a senha)
    const { senha, refreshToken, ...userWithoutSensitiveData } = userToPromote.toObject();

    console.log('✅ Usuário promovido:', userWithoutSensitiveData.email);

    res.json({ 
      message: 'Usuário promovido a administrador com sucesso.',
      user: userWithoutSensitiveData 
    });

  } catch (err) {
    console.error('Erro ao promover usuário:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rebaixar admin para usuário comum (apenas admin)
router.patch('/demote/:userId', adminMiddleware, async (req, res) => {
  try {
    console.log('⬇️ Tentativa de rebaixamento:', {
      adminId: req.userId,
      adminRole: req.userRole,
      targetUserId: req.params.userId
    });

    // Verificar se o usuário logado é admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas admins podem rebaixar usuários.' });
    }

    const { userId } = req.params;

    // Verificar se o usuário a ser rebaixado existe
    const userToDemote = await User.findById(userId);
    if (!userToDemote) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Verificar se o usuário não é admin
    if (userToDemote.role === 'user') {
      return res.status(400).json({ error: 'Usuário já é um usuário comum.' });
    }

    // Verificar se não está tentando rebaixar a si mesmo
    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Você não pode rebaixar a si mesmo.' });
    }

    // Rebaixar o usuário para user
    userToDemote.role = 'user';
    await userToDemote.save();

    // Retornar o usuário atualizado (sem a senha)
    const { senha, refreshToken, ...userWithoutSensitiveData } = userToDemote.toObject();

    console.log('✅ Usuário rebaixado:', userWithoutSensitiveData.email);

    res.json({ 
      message: 'Usuário rebaixado para usuário comum com sucesso.',
      user: userWithoutSensitiveData 
    });

  } catch (err) {
    console.error('Erro ao rebaixar usuário:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;