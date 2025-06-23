import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente que protege rotas sensíveis (ex: painel admin).
 * Permite acesso apenas se o usuário estiver autenticado e for admin.
 *
 * Uso:
 * <PrivateRoute><ComponenteProtegido /></PrivateRoute>
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!token) {
    // Usuário não autenticado → redireciona
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    // Autenticado mas não admin → redireciona para página inicial
    return <Navigate to="/" />;
  }

  // Autenticado e com permissão de admin
  return children;
};

export default PrivateRoute;
