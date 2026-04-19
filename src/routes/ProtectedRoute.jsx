import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../contexts/AuthContext.jsx'
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx'

/**
 * Routes protégées : connexion obligatoire.
 * Si `role` est passé (ex. admin), seuls les comptes avec ce rôle accèdent à la branche.
 * Les acteurs sont séparés : espace utilisateur (`/`) vs espace admin (`/admin`).
 */
export default function ProtectedRoute({ children, role: requiredRole }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && role !== requiredRole) {
    if (requiredRole === 'admin') {
      return <AccessDeniedPage />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

