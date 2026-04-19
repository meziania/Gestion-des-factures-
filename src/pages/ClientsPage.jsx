import React from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

export default function ClientsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Clients</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Prochaine étape: CRUD clients via Firebase Realtime Database.
        </Typography>
      </Paper>
    </Stack>
  )
}

