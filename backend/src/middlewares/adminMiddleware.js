// middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    console.log('🛡️ AdminMiddleware iniciado para:', req.originalUrl);
    
    const authHeader = req.header('Authorization');
    console.log('🔑 AuthHeader recebido:', authHeader ? 'SIM' : 'NÃO');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token não encontrado ou formato incorreto');
      return res.status(401).json({ error: 'Token de acesso não encontrado' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🎫 Token extraído (primeiros 20 chars):', token.substring(0, 20));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Token decodificado:', { 
      userId: decoded.userId, 
      role: decoded.role 
    });

    const user = await User.findById(decoded.userId).select('-senha -refreshToken');
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco:', decoded.userId);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    console.log('👤 Usuário encontrado no banco:', { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      nome: user.nome
    });

    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;

    console.log('✅ Dados adicionados à req:', {
      userId: req.userId,
      userRole: req.userRole
    });

    next();
  } catch (err) {
    console.error('❌ Erro no adminMiddleware:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = adminMiddleware;