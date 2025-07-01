import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const PainelAdmin = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', bairro: '' });
  const navigate = useNavigate();

  const carregarOcorrencias = async () => {
    try {
      const res = await api.get('/ocorrencias');
      setOcorrencias(res.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Você precisa estar logado para acessar o painel.');
        navigate('/login');
      } else {
        alert('Erro ao carregar ocorrências.');
      }
    }
  };

  useEffect(() => {
    carregarOcorrencias();
  }, []);

  const deletarOcorrencia = async (id) => {
    if (!window.confirm('Deseja mesmo excluir esta ocorrência?')) return;
    try {
      await api.delete(`/ocorrencias/${id}`);
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      alert('Erro ao excluir ocorrência.');
    }
  };

  const iniciarEdicao = (ocorrencia) => {
    setEditando(ocorrencia);
    setFormData({
      titulo: ocorrencia.titulo,
      descricao: ocorrencia.descricao,
      bairro: ocorrencia.bairro,
    });
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setFormData({ titulo: '', descricao: '', bairro: '' });
  };

  const salvarEdicao = async () => {
    try {
      await api.put(`/ocorrencias/${editando._id}`, formData);
      setEditando(null);
      setFormData({ titulo: '', descricao: '', bairro: '' });
      carregarOcorrencias();
    } catch (err) {
      alert('Erro ao salvar edição.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h1>Painel Admin</h1>

      {ocorrencias.length === 0 && <p>Nenhuma ocorrência encontrada.</p>}

      <ul>
        {ocorrencias.map((o) => (
          <li key={o._id} style={{ marginBottom: '20px' }}>
            {editando && editando._id === o._id ? (
              <>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Título"
                />
                <br />
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descrição"
                  rows={3}
                />
                <br />
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                />
                <br />
                <button onClick={salvarEdicao}>Salvar</button>
                <button onClick={cancelarEdicao} style={{ marginLeft: '10px' }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <strong>{o.titulo}</strong> - {o.bairro}
                <p>{o.descricao}</p>
                <button onClick={() => iniciarEdicao(o)}>Editar</button>
                <button onClick={() => deletarOcorrencia(o._id)} style={{ marginLeft: '10px' }}>
                  Deletar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PainelAdmin;
