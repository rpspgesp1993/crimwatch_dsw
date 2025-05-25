import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Ranking from './pages/Ranking/Ranking'; // Importe o componente Ranking
import 'leaflet/dist/leaflet.css';
import './styles/main.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ranking" element={<Ranking />} /> {/* Adicione esta linha para a página de ranking */}
      </Routes>
  );
}

export default App;
