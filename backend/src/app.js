const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const rankingRoutes = require('./routes/ranking.routes');
// + outras se existirem
const crimeRoutes = require('./routes/crime.routes');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rotas
app.use('/api/crimes', crimeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ranking', rankingRoutes);

const bairroRoutes = require('./routes/bairro.routes');
app.use('/api/bairros', bairroRoutes);

module.exports = app;
