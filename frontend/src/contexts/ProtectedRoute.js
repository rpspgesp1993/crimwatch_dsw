import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated()) {
    console.log("Usuário NÃO autenticado. Redirecionando para /login");
    return <Navigate to="/login" replace />;
  }
  

  // Se estiver autenticado, renderizar o componente
  return children;
};

export default ProtectedRoute;