import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableBody, TableCell, TableRow,
  IconButton, Tooltip, Paper, Snackbar, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import api from '../services/api';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao carregar usuários', severity: 'error' });
    }
  };

  const excluirUsuario = async (id) => {
    if (!window.confirm('Deseja excluir este usuário?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      fetchUsuarios();
      setSnackbar({ open: true, message: 'Usuário excluído', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao excluir usuário', severity: 'error' });
    }
  };

  const alternarAdmin = async (id) => {
    try {
      await api.put(`/usuarios/${id}/toggle-admin`);
      fetchUsuarios();
      setSnackbar({ open: true, message: 'Perfil alterado com sucesso', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao alterar perfil', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Gestão de Usuários</Typography>
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Nome</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Admin</strong></TableCell>
            <TableCell><strong>Ações</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map(user => (
            <TableRow key={user._id}>
              <TableCell>{user.nome}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.isAdmin ? 'Sim' : 'Não'}</TableCell>
              <TableCell>
                <Tooltip title="Alternar Admin">
                  <IconButton onClick={() => alternarAdmin(user._id)}>
                    <AdminPanelSettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton onClick={() => excluirUsuario(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UsuariosAdmin;
