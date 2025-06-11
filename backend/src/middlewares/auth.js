const jwt = require('jsonwebtoken');

module.exports = function auth(papelMinimo = null) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.sendStatus(401);
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (papelMinimo && payload.papel !== papelMinimo) return res.sendStatus(403);
      req.usuario = payload;
      next();
    } catch {
      return res.sendStatus(401);
	  
	  const auth = require('../middlewares/auth');

router.post('/crimes', auth('pesquisador'), controller.criarCrime);
router.get('/crimes', auth(), controller.listarCrimes); // qualquer logado

    }
  };
};
