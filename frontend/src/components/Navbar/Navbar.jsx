// src/components/Navbar/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logoCrimWatch.png';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = React.useState(null);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAdminMenuClick = (event) => setAdminMenuAnchor(event.currentTarget);
  const handleAdminMenuClose = () => setAdminMenuAnchor(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleAdminNavigation = (path) => {
    navigate(path);
    handleAdminMenuClose();
  };

  // Verificação para admin
  const isAdmin = usuario && usuario.role === 'admin';

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="CrimWatch" style={{ height: '40px', marginRight: '16px' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavLink to="/home" style={{ color: 'white', textDecoration: 'none' }}>
            Mapa
          </NavLink>
          <NavLink to="/nova-ocorrencia" style={{ color: 'white', textDecoration: 'none' }}>
            Registrar Ocorrências
          </NavLink>
          <NavLink to="/ranking" style={{ color: 'white', textDecoration: 'none' }}>
            Ranking de Crimes
          </NavLink>
          
          {/* Menu Admin */}
          {isAdmin && (
            <div>
              <Button
                onClick={handleAdminMenuClick}
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Admin ▼
              </Button>
              <Menu 
                anchorEl={adminMenuAnchor} 
                open={Boolean(adminMenuAnchor)} 
                onClose={handleAdminMenuClose}
              >
                <MenuItem onClick={() => handleAdminNavigation('/painel-admin')}>
                  Painel Admin
                </MenuItem>
                <MenuItem onClick={() => handleAdminNavigation('/admin-usuarios')}>
                  Gerenciar Usuários
                </MenuItem>
              </Menu>
            </div>
          )}

          <div>
            <Button
              onClick={handleMenuClick}
              style={{ color: 'white', padding: '8px', minWidth: 'auto' }}
            >
              {usuario ? usuario.nome || 'Usuário' : (
                <img
                  className="login-icon"
                  src={require('../../assets/do-user.png')}
                  alt="Login"
                />
              )}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              {!usuario ? (
                <MenuItem onClick={() => {
                  handleClose();
                  navigate('/login');
                }}>
                  Entrar
                </MenuItem>
              ) : (
                <>
                  <MenuItem disabled>{usuario.nome || 'Usuário'}</MenuItem>
                  <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </>
              )}
            </Menu>
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;