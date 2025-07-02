const express = require('express');
const router = express.Router();
const Ocorrencia = require('../models/Ocorrencia');
const auth = require('../middleware/auth');

// Listar ocorrências (público)
router.get('/', async (req, res) => {
  try {
    const ocorrencias = await Ocorrencia.find();
    res.json(ocorrencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Atualizar ocorrência (protegido) - ESTA ROTA ESTAVA FALTANDO
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o ID é válido
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const ocorrencia = await Ocorrencia.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!ocorrencia) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    res.json(ocorrencia);
  } catch (err) {
    console.error('Erro ao atualizar ocorrência:', err);
    res.status(500).json({ error: err.message });
  }
});

// Deletar ocorrência (protegido) - ESTA ROTA ESTAVA FALTANDO
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Tentando deletar ID:', id); // Debug
    
    // Verificar se o ID é válido
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const ocorrencia = await Ocorrencia.findByIdAndDelete(id);
    
    if (!ocorrencia) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    res.json({ message: 'Ocorrência excluída com sucesso', ocorrencia });
  } catch (err) {
    console.error('Erro ao deletar ocorrência:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;