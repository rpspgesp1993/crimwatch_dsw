const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email });
  if (!usuario || !(await usuario.validarSenha(senha))) {
    return res.status(401).json({ detail: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: usuario._id, papel: usuario.papel }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
};
