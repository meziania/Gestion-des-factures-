import React from 'react'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function AdminParamsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Admin · Paramètres</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Prochaine étape: CRUD Articles + CRUD Catégories via JSON Server (port 3001).
        </Typography>
      </Paper>
    </Stack>
  )
}

