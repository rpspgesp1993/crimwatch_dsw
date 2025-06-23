import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
  const [porTipo, setPorTipo] = useState([]);
  const [porMes, setPorMes] = useState([]);
  const [porBairro, setPorBairro] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!token || !isAdmin) {
      window.location.href = '/';
      return;
    }

    api.get('/ocorrencias').then(res => {
      const ocorrencias = res.data;

      // 🔹 Por tipo
      const tipos = {};
      ocorrencias.forEach(o => {
        tipos[o.tipo] = (tipos[o.tipo] || 0) + 1;
      });
      setPorTipo(Object.entries(tipos).map(([tipo, total]) => ({ tipo, total })));

      // 🔹 Por mês
      const meses = {};
      ocorrencias.forEach(o => {
        const data = new Date(o.data);
        const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        meses[mes] = (meses[mes] || 0) + 1;
      });
      const porMesFormatado = Object.entries(meses).map(([mes, total]) => ({ mes, total }));
      porMesFormatado.sort((a, b) => a.mes.localeCompare(b.mes));
      setPorMes(porMesFormatado);

      // 🔹 Por bairro
      const bairros = {};
      ocorrencias.forEach(o => {
        if (o.bairro) {
          bairros[o.bairro] = (bairros[o.bairro] || 0) + 1;
        }
      });
      const porBairroArray = Object.entries(bairros).map(([bairro, total]) => ({ bairro, total }));
      porBairroArray.sort((a, b) => b.total - a.total);
      setPorBairro(porBairroArray.slice(0, 10)); // top 10
    });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard do Administrador</h2>

      <h3>Ocorrências por Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={porTipo}>
          <XAxis dataKey="tipo" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Ocorrências por Mês</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={porMes}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Line dataKey="total" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Top 10 Bairros com Mais Ocorrências</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={porBairro}>
          <XAxis dataKey="bairro" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#ff6361" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDashboard;
