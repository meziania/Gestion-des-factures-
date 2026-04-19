import React from 'react'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

function KpiCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{value}</Typography>
    </Paper>
  )
}

export default function DashboardPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Total Factures" value="—" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Total Encaissé" value="—" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="En attente" value="—" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Rejetées" value="—" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">À faire ensuite</Typography>
        <Typography variant="body2" color="text.secondary">
          Brancher Firebase (clients/factures) + JSON Server (articles/catégories) et afficher les
          graphes (Recharts).
        </Typography>
      </Paper>
    </Stack>
  )
}

