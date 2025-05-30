import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme,
  alpha,
  Container,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const drawerWidth = 256; // 16rem = 256px

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Meetings', icon: <EventIcon />, path: '/dashboard/meetings' },
    { text: 'AI Tools', icon: <BuildIcon />, path: '/dashboard/tools/agenda-generator' },
    { text: 'Summaries', icon: <DescriptionIcon />, path: '/dashboard/summaries' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' }
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e5e7eb',
        minHeight: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{
            fontWeight: 700,
            color: '#6366f1',
            letterSpacing: '-0.025em'
          }}
        >
          StopMeet
        </Typography>
      </Box>
      
      {/* Navigation Menu */}
      <List sx={{ px: 3, py: 4, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/dashboard');
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive 
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'transparent',
                  color: isActive 
                    ? '#6366f1'
                    : '#6b7280',
                  borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    color: '#6366f1',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    },
                  },
                  transition: 'all 150ms ease-in-out',
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit',
                  minWidth: 36 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* Bottom Card */}
      <Box sx={{ p: 3, mt: 'auto' }}>
        <Box 
          sx={{
            bgcolor: '#f9fafb',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}
        >
          <AnalyticsIcon sx={{ color: '#6366f1', mb: 1, fontSize: 28 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
            Pro Tip
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            Use AI agenda generation for 25% more efficient meetings
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e5e7eb',
          color: '#1f2937',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ 
          height: '4rem',
          minHeight: '4rem !important',
          px: 3,
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.25rem' }}>
                Meeting Efficiency Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Save time and improve productivity with AI-powered insights
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<EventIcon />}
            sx={{ 
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              '&:focus': {
                outline: '2px solid #6366f1',
                outlineOffset: '2px',
              }
            }}
          >
            New Meeting
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#ffffff',
              borderRight: '1px solid #e5e7eb',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#ffffff',
              borderRight: '1px solid #e5e7eb',
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f9fafb',
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ height: '4rem', minHeight: '4rem !important' }} />
        <Container maxWidth={false} sx={{ 
          py: 6, 
          px: 4,
          maxWidth: '82rem',
          mx: 'auto'
        }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
