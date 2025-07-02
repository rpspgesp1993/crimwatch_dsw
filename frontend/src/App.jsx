// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import NovaOcorrencia from './pages/NovaOcorrencia/NovaOcorrencia';
import Ranking from './pages/Ranking/Ranking';
import PainelAdmin from './pages/Admin/PainelAdmin';
import UsuariosAdmin from './pages/Admin/UsuariosAdmin'; // <-- Importar sua nova página
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './contexts/ProtectedRoute';

function AppRoutes() {
  const { token } = useAuth();
  const location = useLocation();

  // Cleanup do Leaflet ao navegar entre páginas
  useEffect(() => {
    const cleanupLeafletMaps = () => {
      try {
        if (window.L) {
          // Método mais seguro - apenas limpa containers órfãos
          const mapContainers = document.querySelectorAll('.leaflet-container');
          mapContainers.forEach(container => {
            // Verifica se o container não está sendo usado ativamente
            const isActiveContainer = container.offsetParent !== null;
            
            if (!isActiveContainer && container._leaflet_id) {
              try {
                // Só remove se o container não estiver visível (órfão)
                delete container._leaflet_id;
                container.innerHTML = '';
                container.className = container.className.replace(/leaflet-\S+/g, '');
              } catch (e) {
                // Ignora erros de limpeza
              }
            }
          });

          // Limpa apenas referências globais seguras
          if (window.L.DomUtil && typeof window.L.DomUtil._leafletId === 'number') {
            // Não reseta para 0, apenas garante que seja um número válido
            if (window.L.DomUtil._leafletId < 0) {
              window.L.DomUtil._leafletId = 1;
            }
          }
        }
      } catch (error) {
        console.warn('Erro durante limpeza dos mapas:', error);
      }
    };

    // Executa limpeza apenas quando sair de uma página com mapa
    const previousPath = sessionStorage.getItem('previousPath');
    const currentPath = location.pathname;
    
    // Só executa limpeza ao sair de páginas que podem ter mapas
    const pagesWithMaps = ['/home', '/nova-ocorrencia'];
    if (previousPath && pagesWithMaps.includes(previousPath) && previousPath !== currentPath) {
      const timeoutId = setTimeout(cleanupLeafletMaps, 50);
      return () => clearTimeout(timeoutId);
    }
    
    // Armazena o caminho atual para a próxima navegação
    sessionStorage.setItem('previousPath', currentPath);
    
  }, [location.pathname]);

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
        <Route path="admin-usuarios" element={<UsuariosAdmin />} /> {/* Nova rota */}

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