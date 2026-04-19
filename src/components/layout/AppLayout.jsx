import React from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../contexts/AuthContext.jsx'

function NavButton({ to, label }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`)
  return (
    <Button
      component={RouterLink}
      to={to}
      color={active ? 'secondary' : 'inherit'}
      sx={{ textTransform: 'none' }}
    >
      {label}
    </Button>
  )
}

export default function AppLayout() {
  const { user, role, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="primary">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestion des Factures
          </Typography>

          <NavButton to="/dashboard" label="Dashboard" />
          <NavButton to="/clients" label="Clients" />
          <NavButton to="/factures" label="Factures" />
          {role === 'admin' ? <NavButton to="/admin/dashboard" label="Admin" /> : null}

          <Typography variant="body2" sx={{ ml: 2, opacity: 0.9 }}>
            {user?.email ?? 'connecté'}
          </Typography>
          <Button onClick={logout} color="inherit" sx={{ textTransform: 'none' }}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

