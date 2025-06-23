import React from 'react';
import { Button, Menu, MenuItem, Typography } from '@mui/material';

const UserMenu = ({ anchorEl, handleClose, handleLogout }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem disabled>
        <Typography variant="body2">Richard</Typography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>Sair</MenuItem>
    </Menu>
  );
};

export default UserMenu;
