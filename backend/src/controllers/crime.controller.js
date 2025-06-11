const Crime = require('../models/crime.model');

exports.listarCrimes = async (req, res) => {
  try {
    const { tipo } = req.query;
    const filtro = tipo ? { tipo } : {};
    const crimes = await Crime.find(filtro);
    res.json(crimes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.criarCrime = async (req, res) => {
  try {
    const crime = new Crime(req.body);
    await crime.save();
    res.status(201).json(crime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
