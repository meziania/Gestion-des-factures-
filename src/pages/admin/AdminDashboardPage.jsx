import React from 'react'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function AdminDashboardPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Admin · Dashboard</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Prochaine étape: KPIs + graphiques (Recharts) + validation factures.
        </Typography>
      </Paper>
    </Stack>
  )
}

