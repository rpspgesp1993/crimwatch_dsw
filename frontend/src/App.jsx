// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import NovaOcorrencia from './pages/NovaOcorrencia/NovaOcorrencia';
import Ranking from './pages/Ranking/Ranking';
import PainelAdmin from './pages/PainelAdmin';
import UsuariosAdmin from './pages/UsuariosAdmin'; // <-- Importar sua nova página
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './contexts/ProtectedRoute';

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={!token ? <LoginPage /> : <Navigate to="/home" />}
      />
      <Route
        path="/register"
        element={!token ? <RegisterPage /> : <Navigate to="/home" />}
      />

      {/* Rotas protegidas (exigem autenticação) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Rota padrão redireciona para home */}
        <Route index element={<Navigate to="/home" />} />
        <Route path="home" element={<Home />} />
        <Route path="nova-ocorrencia" element={<NovaOcorrencia />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="painel-admin" element={<PainelAdmin />} />
        <Route path="admin/usuarios" element={<UsuariosAdmin />} /> {/* Nova rota */}

        {/* Qualquer outra rota dentro da área protegida redireciona para home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Route>

      {/* Qualquer rota inválida fora da área protegida redireciona para login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
