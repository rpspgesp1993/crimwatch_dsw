require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Adiciona as rotas de ocorrência aqui:
app.use('/api/ocorrencias', require('./routes/ocorrencias'));

// Conecta ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar no MongoDB:', err));

// Rota de teste
app.get('/', (req, res) => {
  res.send('API CrimWatch funcionando!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
