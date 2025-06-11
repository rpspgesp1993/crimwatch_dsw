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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './contexts/ProtectedRoute';

// Componente interno que usa o contexto de autenticação
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Verificando autenticação...</p>
      </div>
    );
  }
  

  return (
    <Routes>
      {/* Public routes (no layout) */}
      <Route
        path="/login"
        element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/home" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated() ? <RegisterPage /> : <Navigate to="/home" />}
      />

      {/* Protected routes (with layout) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to="/home" />}
        />
        <Route
          path="home"
          element={<Home />}
        />
        <Route
          path="nova-ocorrencia"
          element={<NovaOcorrencia />}
        />
        <Route
          path="ranking"
          element={<Ranking />}
        />
        <Route
          path="painel-admin"
          element={<PainelAdmin />}
        />

        {/* Redirects */}
        <Route
          path="*"
          element={<Navigate to="/home" />}
        />
      </Route>

      {/* Catch all redirect for unauthenticated users */}
      <Route
        path="*"
        element={<Navigate to="/login" />}
      />
    </Routes>
  );
}

// Componente principal exportado
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}