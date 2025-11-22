import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectSidebarOpen, toggleSidebar } from '../../app/uiSlice';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const DRAWER_WIDTH = 240; // Narrower for locations-only sidebar

function AppLayout() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for fixed header
          width: {
            md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AppLayout;
