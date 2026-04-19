import React from 'react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function InvoiceCreatePage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Nouvelle facture</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Prochaine étape: formulaire dynamique (articles + quantités + remises) et calcul auto.
        </Typography>
      </Paper>
      <Stack direction="row" spacing={1}>
        <Button disabled variant="contained">
          Enregistrer
        </Button>
        <Button disabled variant="outlined">
          Générer PDF
        </Button>
      </Stack>
    </Stack>
  )
}

