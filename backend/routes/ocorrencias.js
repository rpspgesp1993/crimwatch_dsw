const express = require('express');
const router = express.Router();
const Ocorrencia = require('../models/Ocorrencia');

// Criar nova ocorrência
router.post('/', async (req, res) => {
  try {
    const nova = new Ocorrencia(req.body);
    const salva = await nova.save();
    res.status(201).json(salva);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Listar todas ou filtrar
router.get('/', async (req, res) => {
  const filtro = {};
  if (req.query.bairro) filtro.bairro = req.query.bairro;
  if (req.query.tipo) filtro.tipo = req.query.tipo;

  const ocorrencias = await Ocorrencia.find(filtro).sort({ data: -1 });
  res.json(ocorrencias);
});

module.exports = router;
