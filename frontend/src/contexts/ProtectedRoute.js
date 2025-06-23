import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  // Enquanto verifica o token, você pode opcionalmente mostrar loading:
  // (só adicione isso se implementar 'loading' no AuthContext futuramente)

  if (!token) {
    console.log("Usuário NÃO autenticado. Redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
