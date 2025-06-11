const express = require('express');
const router = express.Router();
const { rankingCrimes } = require('../controllers/ranking.controller');

router.get('/', rankingCrimes);

module.exports = router;
