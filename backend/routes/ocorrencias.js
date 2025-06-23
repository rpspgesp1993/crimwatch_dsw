const express = require('express');
const router = express.Router();
const Ocorrencia = require('../models/Ocorrencia');
const auth = require('../middleware/auth');

// Listar ocorrências (público)
router.get('/', async (req, res) => {
  const ocorrencias = await Ocorrencia.find();
  res.json(ocorrencias);
});

// Criar ocorrência (protegido)
router.post('/', auth, async (req, res) => {
  try {
    const nova = new Ocorrencia(req.body);
    await nova.save();
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
