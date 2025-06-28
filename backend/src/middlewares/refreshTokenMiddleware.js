const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ error: 'Refresh token não fornecido' });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Refresh token inválido ou expirado' });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};
