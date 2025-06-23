
import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

const PainelAdmin = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', bairro: '' });

  const carregarOcorrencias = async () => {
    const res = await api.get('/api/ocorrencias');
    setOcorrencias(res.data);
  };

  useEffect(() => {
    carregarOcorrencias();
  }, []);

  const deletarOcorrencia = async (id) => {
    if (!window.confirm('Deseja mesmo excluir esta ocorrência?')) return;
    try {
      await api.delete(`/api/ocorrencias/${id}`);
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      alert('Erro ao excluir ocorrência.');
    }
  };

  const salvarEdicao = async () => {
    try {
      await api.put(`/api/ocorrencias/${editando._id}`, formData);
      setEditando(null);
      setFormData({ titulo: '', descricao: '', bairro: '' });
      carregarOcorrencias();
    } catch (err) {
      alert('Erro ao salvar edição.');
    }
  };

  return <div>Painel Admin</div>;
};

export default PainelAdmin;
