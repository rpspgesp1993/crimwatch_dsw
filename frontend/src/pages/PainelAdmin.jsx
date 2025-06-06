// src/pages/PainelAdmin.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

export default function PainelAdmin() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ tipo: '', municipio: '', bairro: '', descricao: '' });

  const carregarOcorrencias = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ocorrencias');
      setOcorrencias(res.data);
    } catch (err) {
      setErro('Erro ao carregar ocorrências.');
    }
  };

  const deletarOcorrencia = async (id) => {
    if (!window.confirm('Deseja mesmo excluir esta ocorrência?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/ocorrencias/${id}`);
      setOcorrencias(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      alert('Erro ao excluir ocorrência.');
    }
  };

  const abrirEdicao = (ocorrencia) => {
    setEditando(ocorrencia);
    setFormData({
      tipo: ocorrencia.tipo,
      municipio: ocorrencia.municipio || '',
      bairro: ocorrencia.bairro || '',
      descricao: ocorrencia.descricao || ''
    });
  };

  const salvarEdicao = async () => {
    try {
      await axios.put(`http://localhost:5000/api/ocorrencias/${editando._id}`, formData);
      setEditando(null);
      setFormData({ tipo: '', municipio: '', bairro: '', descricao: '' });
      carregarOcorrencias();
    } catch (err) {
      alert('Erro ao salvar edição.');
    }
  };

  useEffect(() => {
    carregarOcorrencias();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo
      </Typography>
      {erro && <Typography color="error">{erro}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
              <TableCell><strong>Município</strong></TableCell>
              <TableCell><strong>Bairro</strong></TableCell>
              <TableCell><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ocorrencias.map((oc) => (
              <TableRow key={oc._id}>
                <TableCell>{oc.tipo}</TableCell>
                <TableCell>{new Date(oc.data).toLocaleString()}</TableCell>
                <TableCell>{oc.municipio}</TableCell>
                <TableCell>{oc.bairro}</TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => abrirEdicao(oc)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => deletarOcorrencia(oc._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editando)} onClose={() => setEditando(null)}>
        <DialogTitle>Editar Ocorrência</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Tipo" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} fullWidth />
          <TextField label="Município" value={formData.municipio} onChange={e => setFormData({ ...formData, municipio: e.target.value })} fullWidth />
          <TextField label="Bairro" value={formData.bairro} onChange={e => setFormData({ ...formData, bairro: e.target.value })} fullWidth />
          <TextField label="Descrição" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarEdicao}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
