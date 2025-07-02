import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import './PainelAdmin.css';

const PainelAdmin = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ tipo: '', municipio: '', descricao: '', bairro: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const carregarOcorrencias = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      tipo: ocorrencia.tipo,
      municipio: ocorrencia.municipio,
      descricao: ocorrencia.descricao,
      bairro: ocorrencia.bairro,
    });
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setFormData({ tipo: '', municipio: '', descricao: '', bairro: '' });
  };

  const salvarEdicao = async () => {
    if (!formData.tipo.trim() || !formData.municipio.trim() || !formData.descricao.trim() || !formData.bairro.trim()) {
      alert('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await api.put(`/ocorrencias/${editando._id}`, formData);
      setEditando(null);
      setFormData({ tipo: '', municipio: '', descricao: '', bairro: '' });
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
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">Painel Administrativo</h1>
          <p className="admin-subtitle">Gerenciar Ocorrências</p>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando ocorrências...</p>
          </div>
        ) : (
          <>
            {ocorrencias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Nenhuma ocorrência encontrada</h3>
                <p>Não há ocorrências cadastradas no sistema.</p>
              </div>
            ) : (
              <div className="ocorrencias-container">
                <div className="stats-header">
                  <div className="stat-item">
                    <span className="stat-number">{ocorrencias.length}</span>
                    <span className="stat-label">Total de Ocorrências</span>
                  </div>
                </div>

                <div className="ocorrencias-list">
                  {ocorrencias.map((o) => (
                    <div key={o._id} className="ocorrencia-card">
                      {editando && editando._id === o._id ? (
                        <div className="edit-form">
                          <div className="edit-header">
                            <h3>Editando Ocorrência</h3>
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Tipo de Ocorrência</label>
                            <input
                              type="text"
                              name="tipo"
                              value={formData.tipo}
                              onChange={handleChange}
                              placeholder="Digite o tipo da ocorrência"
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Município</label>
                            <input
                              type="text"
                              name="municipio"
                              value={formData.municipio}
                              onChange={handleChange}
                              placeholder="Digite o município"
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Bairro</label>
                            <input
                              type="text"
                              name="bairro"
                              value={formData.bairro}
                              onChange={handleChange}
                              placeholder="Digite o bairro"
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Descrição</label>
                            <textarea
                              name="descricao"
                              value={formData.descricao}
                              onChange={handleChange}
                              placeholder="Digite a descrição da ocorrência"
                              rows={4}
                              className="form-textarea"
                            />
                          </div>

                          <div className="form-actions">
                            <button onClick={salvarEdicao} className="btn-primary">
                              💾 Salvar
                            </button>
                            <button onClick={cancelarEdicao} className="btn-secondary">
                              ❌ Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="ocorrencia-content">
                          <div className="ocorrencia-header">
                            <h3 className="ocorrencia-tipo">{o.tipo}</h3>
                            <span className="ocorrencia-localizacao">{o.municipio} - {o.bairro}</span>
                          </div>
                          
                          <div className="ocorrencia-body">
                            <p className="ocorrencia-descricao">{o.descricao}</p>
                          </div>

                          <div className="ocorrencia-actions">
                            <button 
                              onClick={() => iniciarEdicao(o)} 
                              className="btn-edit"
                            >
                              ✏️ Editar
                            </button>
                            <button 
                              onClick={() => deletarOcorrencia(o._id)} 
                              className="btn-delete"
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PainelAdmin;