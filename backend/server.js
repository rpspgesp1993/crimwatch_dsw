const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ocorrenciasRoutes = require('./routes/ocorrencias');
const authRoutes = require('./routes/auth');

app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crimwatch')
  .then(() => app.listen(5000, () => console.log('Servidor rodando na porta 5000')))
  .catch(err => console.error(err));
