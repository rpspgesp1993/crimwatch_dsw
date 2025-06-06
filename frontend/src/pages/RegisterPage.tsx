import { useState } from 'react';
import api from '@/api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { nome, email, senha });
      setMensagem('Cadastro realizado com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMensagem('Erro ao cadastrar usuário');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}>
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <label>Nome:</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        <br /><br />
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <br /><br />
        <label>Senha:</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <br /><br />
        <button type="submit">Cadastrar</button>
      </form>
      <p>{mensagem}</p>
    </div>
  );
}
