import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (token && usuarioSalvo && usuarioSalvo !== 'undefined') {
      try {
        const userData = JSON.parse(usuarioSalvo);
        setUsuario(userData);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao fazer login');
      }

      if (!data.token || !data.user) {
        throw new Error('Resposta do servidor inválida');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      setUsuario(data.user);

      return { success: true, usuario: data.user };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  const cadastro = async (nome, email, senha) => {
    try {
      const response = await fetch('http://localhost:4000/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao fazer cadastro');
      }

      return { success: true, mensagem: data.mensagem };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const isAuthenticated = () => {
    return !!usuario && !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ usuario, login, cadastro, logout, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
