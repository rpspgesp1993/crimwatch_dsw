import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const tokenSalvo = localStorage.getItem('token');
        const usuarioSalvo = localStorage.getItem('usuario');

        console.log('🔍 Dados salvos no localStorage:', {
          hasToken: !!tokenSalvo,
          usuarioSalvo: usuarioSalvo
        });

        if (tokenSalvo && usuarioSalvo && usuarioSalvo !== 'undefined') {
          const parsedUsuario = JSON.parse(usuarioSalvo);
          
          // ✅ MUDANÇA: Verificar tanto _id quanto id
          const userId = parsedUsuario._id || parsedUsuario.id;
          if (parsedUsuario && userId && parsedUsuario.email) {
            setToken(tokenSalvo);
            setUsuario(parsedUsuario);
            api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
            
            console.log('👤 Usuário carregado do localStorage:', parsedUsuario);
          } else {
            console.warn('⚠️ Dados do usuário incompletos, limpando localStorage');
            clearStorageData();
          }
        } else {
          console.log('📝 Nenhum dado válido encontrado no localStorage');
          clearStorageData();
        }
      } catch (error) {
        console.error('❌ Erro ao parsear usuário do localStorage:', error);
        clearStorageData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearStorageData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email, senha) => {
    console.log('🔎 Tentativa de login para:', email);

    try {
      const res = await api.post('/auth/login', { email, senha });
      
      console.log('✅ Resposta COMPLETA do servidor:', res);
      console.log('📦 Dados res.data:', res.data);
      
      const { token, user, usuario } = res.data;
      const userData = user || usuario;
      
      console.log('🎫 Token recebido:', token);
      console.log('👤 userData final:', userData);

      if (!userData) {
        throw new Error('Nenhum dado de usuário recebido do servidor');
      }
      
      // ✅ MUDANÇA: Verificar tanto _id quanto id
      const userId = userData._id || userData.id;
      if (!userId) {
        throw new Error('ID do usuário não encontrado na resposta do servidor');
      }
      
      if (!userData.email) {
        throw new Error('Email do usuário não encontrado na resposta do servidor');
      }

      // ✅ MUDANÇA: Normalizar o objeto do usuário para sempre ter _id
      const normalizedUserData = {
        ...userData,
        _id: userId, // Garantir que sempre tenha _id
        id: userId   // Manter id também para compatibilidade
      };

      clearStorageData();

      setUsuario(normalizedUserData);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(normalizedUserData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      console.log('💾 Dados salvos no localStorage após login');

      return { sucesso: true };
    } catch (err) {
      console.error('❌ Erro no login:', err);
      clearStorageData();
      
      return { 
        sucesso: false, 
        erro: err.response?.data?.error || err.message || 'Erro ao logar' 
      };
    }
  };

  const cadastrar = async (nome, email, senha) => {
    try {
      const res = await api.post('/auth/register', { nome, email, senha });
      console.log('✅ Resposta do cadastro:', res.data);
      return { sucesso: true, data: res.data };
    } catch (err) {
      console.error('❌ Erro no cadastro:', err);
      return { 
        sucesso: false, 
        erro: err.response?.data?.error || err.message || 'Erro ao cadastrar' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    clearStorageData();
  };

  const updateUser = (updatedUser) => {
    if (updatedUser) {
      const userId = updatedUser._id || updatedUser.id;
      if (userId) {
        // ✅ MUDANÇA: Normalizar dados atualizados também
        const normalizedUserData = {
          ...updatedUser,
          _id: userId,
          id: userId
        };
        
        setUsuario(normalizedUserData);
        localStorage.setItem('usuario', JSON.stringify(normalizedUserData));
        console.log('🔄 Dados do usuário atualizados:', normalizedUserData);
      }
    }
  };

  const user = usuario;
  const isAdmin = usuario?.role === 'admin';

  console.log('🔍 AuthContext Debug:', {
    usuario,
    user,
    isAdmin,
    role: usuario?.role,
    hasToken: !!token,
    loading
  });

  const contextValue = {
    usuario,
    user,
    token,
    isAdmin,
    loading,
    login,
    cadastrar,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};