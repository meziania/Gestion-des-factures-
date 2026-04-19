import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function InvoicesPage() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Factures</Typography>
        <Button component={RouterLink} to="/factures/nouvelle" variant="contained">
          Nouvelle facture
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Prochaine étape: liste des factures depuis Firebase + filtre par statut.
        </Typography>
      </Paper>
    </Stack>
  )
}

