import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '../contexts/AuthContext.jsx'

/** Affiché quand un compte « user » tente d’ouvrir une route réservée aux administrateurs. */
export default function AccessDeniedPage() {
  const { logout } = useAuth()
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'grey.50' }}>
      <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Accès réservé aux administrateurs</Typography>
          <Alert severity="info">
            Vous êtes connecté avec un compte <strong>utilisateur</strong> (comptable / agent). Les
            fonctionnalités d’<strong>administration</strong> (articles, catégories, dashboard global)
            sont dans l’espace réservé au rôle <strong>admin</strong>, défini dans Firebase (
            <code>users/&lt;uid&gt;/role</code>).
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Si vous devez être administrateur, demandez à un admin de définir votre rôle, ou
            modifiez-le dans la Realtime Database (console Firebase).
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/dashboard" variant="contained" fullWidth>
              Retour à mon espace utilisateur
            </Button>
            <Button variant="outlined" color="inherit" fullWidth onClick={() => logout()}>
              Déconnexion
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
