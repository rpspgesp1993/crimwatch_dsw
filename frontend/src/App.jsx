// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage';
import NovaOcorrencia from './pages/NovaOcorrencia';
import Ranking from './pages/Ranking/Ranking';
import PainelAdmin from './pages/PainelAdmin';

export default function App() {
  return (
    <Routes>
      {/* Todas as rotas agora são públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/nova" element={<NovaOcorrencia />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/admin" element={<PainelAdmin />} />

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
