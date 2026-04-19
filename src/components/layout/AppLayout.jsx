import React from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AddIcon from '@mui/icons-material/Add'
import HistoryIcon from '@mui/icons-material/History'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import CategoryIcon from '@mui/icons-material/Category'
import LogoutIcon from '@mui/icons-material/Logout'
import Chip from '@mui/material/Chip'
import { useAuth } from '../../contexts/AuthContext.jsx'

const DRAWER_WIDTH = 260

function NavItem({ to, icon, label, onClick }) {
  const location = useLocation()
  const selected = location.pathname === to || location.pathname.startsWith(`${to}/`)
  return (
    <ListItemButton
      component={RouterLink}
      to={to}
      selected={selected}
      onClick={onClick}
      sx={{ borderRadius: 1, mx: 1 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}

export default function AppLayout() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const isAdminSection = location.pathname.startsWith('/admin')

  const handleDrawerToggle = () => setMobileOpen((o) => !o)

  const userNav = (
    <>
      <NavItem
        to="/dashboard"
        icon={<DashboardIcon />}
        label="Tableau de bord"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      <NavItem
        to="/clients"
        icon={<PeopleIcon />}
        label="Clients"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      <NavItem
        to="/factures"
        icon={<HistoryIcon />}
        label="Historique factures"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      <NavItem
        to="/factures/nouvelle"
        icon={<AddIcon />}
        label="Nouvelle facture"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      {role === 'admin' ? (
        <NavItem
          to="/admin/dashboard"
          icon={<AdminPanelSettingsIcon />}
          label="Administration"
          onClick={() => !isMdUp && setMobileOpen(false)}
        />
      ) : null}
    </>
  )

  const adminNav = (
    <>
      <NavItem
        to="/admin/dashboard"
        icon={<DashboardIcon />}
        label="Dashboard admin"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      <NavItem
        to="/admin/articles"
        icon={<Inventory2Icon />}
        label="Articles"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      <NavItem
        to="/admin/categories"
        icon={<CategoryIcon />}
        label="Catégories"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
      <Divider sx={{ my: 1 }} />
      <NavItem
        to="/dashboard"
        icon={<ReceiptLongIcon />}
        label="Retour application"
        onClick={() => !isMdUp && setMobileOpen(false)}
      />
    </>
  )

  const drawer = (
    <Box sx={{ overflow: 'auto', pt: 1, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Toolbar sx={{ px: 2, minHeight: 56, flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {isAdminSection ? 'Espace administrateur' : 'Espace utilisateur'}
        </Typography>
        <Chip
          size="small"
          color={role === 'admin' ? 'secondary' : 'default'}
          label={role === 'admin' ? 'Rôle : Administrateur' : 'Rôle : Utilisateur'}
          sx={{ fontWeight: 600 }}
        />
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1 }}>{isAdminSection ? adminNav : userNav}</List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
            aria-label="ouvrir le menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {isAdminSection ? 'Administration (paramètres & pilotage)' : 'Activité comptable'}
          </Typography>
          <Chip
            size="small"
            label={isAdminSection ? 'Mode admin' : 'Mode utilisateur'}
            sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}
            color={isAdminSection ? 'secondary' : 'default'}
          />
          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={() => logout()} aria-label="déconnexion">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
