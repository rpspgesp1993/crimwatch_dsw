const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ocorrenciasRoutes = require('./routes/ocorrencias');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users'); // ADICIONE ESTA LINHA

app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes); // ADICIONE ESTA LINHA

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crimwatch')
  .then(() => app.listen(process.env.PORT || 5000, () => console.log(`Servidor rodando na porta ${process.env.PORT || 5000}`)))
  .catch(err => console.error(err));