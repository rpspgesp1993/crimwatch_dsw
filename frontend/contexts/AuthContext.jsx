import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

console.log('🛑 AuthContext carregado - frontend em execução!');

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 controle de carregamento

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
    }

    setLoading(false); // 👈 finaliza o loading
  }, []);

  const login = async (email, senha) => {
    console.log('🔎 Enviando para o backend:', { email, senha });

    try {
      const res = await api.post('/auth/login', { email, senha });
      const { token, usuario } = res.data;

      setUsuario(usuario);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { sucesso: true };
    } catch (err) {
      console.error('Erro no login:', err);
      return { sucesso: false, erro: err.response?.data?.error || 'Erro ao logar' };
    }
  };

  const cadastrar = async (nome, email, senha) => {
    try {
      const res = await api.post('/auth/register', { nome, email, senha });
      return { sucesso: true, data: res.data };
    } catch (err) {
      console.error('Erro no cadastro:', err);
      return { sucesso: false, erro: err.response?.data?.error || 'Erro ao cadastrar' };
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
