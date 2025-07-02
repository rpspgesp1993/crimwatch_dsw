import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './UsuariosAdmin.css';

const UsuariosAdmin = () => {
  const { user, token, isAdmin, logout, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  // No UsuariosAdmin.jsx

const fetchUsuarios = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('📋 Buscando usuários...');
    console.log('Token presente:', !!token);
    console.log('isAdmin:', isAdmin);
    console.log('User role:', user?.role);

    if (!token) {
      throw new Error('Token de acesso não encontrado');
    }

    // CORREÇÃO: Usar /auth/users já que a rota está no auth.js
    const response = await api.get('/auth/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    setUsuarios(response.data);
    
    console.log('✅ Usuários carregados:', response.data.length);
    
    setSnackbar({
      open: true,
      message: `${response.data.length} usuários carregados com sucesso`,
      severity: 'success'
    });
  } catch (err) {
    console.error('❌ Erro ao carregar usuários:', err);
    console.error('❌ Detalhes do erro:', {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      url: err.config?.url
    });
    
    setError(err);
    
    let errorMessage = err.response?.data?.error || err.message;
    
    if (err.response?.status === 401) {
      errorMessage = 'Sessão expirada. Faça login novamente.';
      setTimeout(() => logout(), 2000);
    } else if (err.response?.status === 403) {
      errorMessage = 'Acesso negado. Apenas administradores podem acessar esta página.';
    } else if (err.response?.status === 404) {
      errorMessage = 'Rota não encontrada. Verifique a configuração do servidor.';
    }

    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }

  console.log('🔍 Token sendo enviado:', token?.substring(0, 30) + '...');
};

const handleRoleChange = async (userId, currentRole) => {
  const isPromote = currentRole !== 'admin';
  const endpoint = isPromote ? 'promote' : 'demote';
  const action = isPromote ? 'promover' : 'rebaixar';

  if (!window.confirm(`Deseja ${action} este usuário?`)) return;

  try {
    console.log(`🔄 ${isPromote ? 'Promovendo' : 'Rebaixando'} usuário:`, userId);
    
    // CORREÇÃO: Usar /auth/ já que as rotas estão no auth.js
    const response = await api.patch(`/auth/${endpoint}/${userId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Operação bem-sucedida:', response.data);
    
    setSnackbar({
      open: true,
      message: response.data.message,
      severity: 'success'
    });
    
    // Recarregar a lista de usuários
    fetchUsuarios();
  } catch (err) {
    console.error(`❌ Erro ao ${action} usuário:`, err);
    
    let errorMessage = err.response?.data?.error || `Erro ao ${action} usuário`;
    
    if (err.response?.status === 401) {
      errorMessage = 'Sessão expirada. Faça login novamente.';
      setTimeout(() => logout(), 2000);
    }
    
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  }
};

  // Verificar autenticação e carregar dados
  useEffect(() => {
    // Aguardar o AuthContext terminar de carregar
    if (authLoading) {
      return;
    }

    // Verificar se está autenticado
    if (!token || !user) {
      setError(new Error('Usuário não autenticado'));
      setLoading(false);
      return;
    }

    // Verificar se é admin
    if (!isAdmin) {
      setError(new Error('Acesso negado. Apenas administradores podem acessar esta página.'));
      setLoading(false);
      return;
    }
    
    fetchUsuarios();
  }, [token, user, isAdmin, authLoading]);

  // Fechar snackbar
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Mostrar loading se AuthContext ainda está carregando
  if (authLoading) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se não está autenticado
  if (!token || !user) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Acesso não autorizado</h3>
            <p>Você precisa estar logado para acessar esta página.</p>
            <button onClick={() => window.location.href = '/login'} className="btn-primary">
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se não é admin
  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-icon">⛔</div>
            <h3>Acesso Restrito</h3>
            <p>Apenas administradores podem acessar esta página.</p>
            <button onClick={() => window.history.back()} className="btn-primary">
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading apenas se não há erro e está carregando
  if (loading && !error) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Erro ao carregar usuários</h3>
            <p>{error.message}</p>
            <button onClick={fetchUsuarios} className="btn-primary">
              🔄 Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">Gestão de Usuários</h1>
          <p className="admin-subtitle">Controle de Acesso e Permissões</p>
        </div>

        {/* Informações do usuário logado */}
        <div className="user-info-card">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <span className="user-name">{user?.nome}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <div className={`user-role ${user?.role === 'admin' ? 'admin' : 'user'}`}>
            {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-header">
          <div className="stat-item">
            <span className="stat-number">{usuarios.length}</span>
            <span className="stat-label">Total de Usuários</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{usuarios.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Administradores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{usuarios.filter(u => u.role !== 'admin').length}</span>
            <span className="stat-label">Usuários Comuns</span>
          </div>
        </div>

        {/* Botão de atualizar */}
        <div className="actions-header">
          <button
            onClick={fetchUsuarios}
            disabled={loading}
            className="btn-refresh"
          >
            🔄 Atualizar Lista
          </button>
        </div>

        {usuarios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Nenhum usuário encontrado</h3>
            <p>Não há usuários cadastrados no sistema.</p>
          </div>
        ) : (
          <div className="usuarios-container">
            <div className="usuarios-list">
              {usuarios.map(usuario => (
                <div key={usuario._id} className="usuario-card">
                  <div className="usuario-content">
                    <div className="usuario-header">
                      <div className="usuario-avatar">
                        {usuario.role === 'admin' ? '👑' : '👤'}
                      </div>
                      <div className="usuario-info">
                        <h3 className="usuario-nome">{usuario.nome}</h3>
                        <span className="usuario-email">{usuario.email}</span>
                      </div>
                      <div className={`usuario-role ${usuario.role === 'admin' ? 'admin' : 'user'}`}>
                        {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </div>
                    </div>
                    
                    <div className="usuario-actions">
                      <button
                        onClick={() => handleRoleChange(usuario._id, usuario.role)}
                        disabled={usuario._id === user?._id}
                        className={`btn-role-change ${usuario.role === 'admin' ? 'demote' : 'promote'}`}
                        title={
                          usuario._id === user?._id 
                            ? 'Você não pode alterar seu próprio role' 
                            : usuario.role === 'admin' 
                              ? 'Rebaixar para usuário' 
                              : 'Promover a administrador'
                        }
                      >
                        {usuario._id === user?._id 
                          ? '🔒 Próprio Usuário' 
                          : usuario.role === 'admin' 
                            ? '⬇️ Rebaixar' 
                            : '⬆️ Promover'
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snackbar personalizado */}
        {snackbar.open && (
          <div className={`snackbar ${snackbar.severity}`}>
            <div className="snackbar-content">
              <span className="snackbar-icon">
                {snackbar.severity === 'success' ? '✅' : 
                 snackbar.severity === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="snackbar-message">{snackbar.message}</span>
              <button onClick={closeSnackbar} className="snackbar-close">✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosAdmin;