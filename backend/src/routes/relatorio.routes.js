const express = require('express');
const router = express.Router();
const { relatorioPorPeriodo } = require('../controllers/relatorio.controller');
const auth = require('../middlewares/auth');

router.get('/', auth('pesquisador'), relatorioPorPeriodo);

module.exports = router;
