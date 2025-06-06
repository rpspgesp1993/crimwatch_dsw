const express = require('express');
const router = express.Router();
const controller = require('../controllers/crime.controller');

router.get('/', controller.listarCrimes);
router.post('/', controller.criarCrime);

module.exports = router;
