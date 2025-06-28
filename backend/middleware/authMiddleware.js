const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    console.log('401 Unauthorized - Token não fornecido no header Authorization');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token válido para o usuário:', decoded.id);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.log('403 Forbidden - Token inválido:', err.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};
