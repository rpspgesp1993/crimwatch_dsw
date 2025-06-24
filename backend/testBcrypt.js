const bcrypt = require('bcrypt');  // ✅ Agora usando o bcrypt correto

const senhaDigitada = '123456';
const hashDoBanco = '$2b$10$J25JFcUoijRQHbXwvWFmmuYAVsaCb1h9CoZ1BLlmgXjCAirQ7nxEi';  // Use o hash real do banco!

(async () => {
  const resultado = await bcrypt.compare(senhaDigitada, hashDoBanco);
  console.log('✅ Resultado do compare manual:', resultado);
})();
