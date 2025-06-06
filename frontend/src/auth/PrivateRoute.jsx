import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './useUser';

export default function RoleRoute({ children, papel }) {
  const usuario = useUser();

  if (!usuario) return <Navigate to="/login" />;
  if (usuario.papel !== papel) return <Navigate to="/" />;

  return children;
}
