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

function AppRoutes() {
  const { token } = useAuth(); // ✅ substitui isAuthenticated()

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

      {/* Rotas protegidas (com layout) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" />} />
        <Route path="home" element={<Home />} />
        <Route path="nova-ocorrencia" element={<NovaOcorrencia />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="painel-admin" element={<PainelAdmin />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Route>

      {/* Fallback: qualquer rota inválida vai pro login */}
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
