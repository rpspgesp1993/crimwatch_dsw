// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import api from '../api/axiosInstance'; // Corrigido: sem o @

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token } = response.data;
      localStorage.setItem('token', token);
      alert('Login bem-sucedido!');
    } catch (err) {
      console.error('Falha no login:', err);
      alert('Erro ao fazer login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;
