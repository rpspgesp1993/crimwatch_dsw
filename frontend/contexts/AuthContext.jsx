import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
      axios.defaults.headers.common['Authorization'] = tokenSalvo;
    }
  }, []);

  const login = async (email, senha) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, senha });
      const { token, usuario } = res.data;

      setUsuario(usuario);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      axios.defaults.headers.common['Authorization'] = token;

      return { sucesso: true };
    } catch (err) {
      return { sucesso: false, erro: err.response?.data?.error || 'Erro ao logar' };
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
