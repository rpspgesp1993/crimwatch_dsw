// src/components/Layout/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar/Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      {/* Rodapé pode ser adicionado aqui se for global */}
    </Box>
  );
};

export default Layout;
