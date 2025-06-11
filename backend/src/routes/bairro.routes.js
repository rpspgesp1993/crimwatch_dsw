const express = require('express');
const router = express.Router();
const { listarBairrosComDensidade } = require('../controllers/bairro.controller');

router.get('/', listarBairrosComDensidade);

module.exports = router;
