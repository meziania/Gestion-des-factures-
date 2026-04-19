import React from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TableContainer from '@mui/material/TableContainer'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import EditIcon from '@mui/icons-material/Edit'
import { useAuth } from '../contexts/AuthContext.jsx'
import { firebaseService } from '../services/firebaseService.js'
import { jsonService } from '../services/jsonService.js'
import { downloadInvoicePdf } from '../utils/pdfInvoice.js'
import { formatCurrencyEUR, formatDateISO } from '../utils/format.js'

const STATUTS = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'payee', label: 'Payée' },
  { value: 'rejetee', label: 'Rejetée' },
]

const VIREMENTS = ['', 'SEPA', 'International', 'Chèque', 'Espèces', 'Autre']

const trackSchema = yup.object({
  statut: yup.string().oneOf(['en_attente', 'payee', 'rejetee']).required(),
  date_depot: yup.string(),
  date_encaissement: yup.string(),
  type_virement: yup.string(),
})

function statutColor(s) {
  if (s === 'payee') return 'success'
  if (s === 'rejetee') return 'error'
  return 'warning'
}

export default function InvoicesPage() {
  const { role } = useAuth()
  const [factures, setFactures] = React.useState([])
  const [clients, setClients] = React.useState([])
  const [societe, setSociete] = React.useState(null)
  const [filter, setFilter] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [editRow, setEditRow] = React.useState(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const [f, cl, params] = await Promise.all([
        firebaseService.isConfigured() ? firebaseService.listFactures() : Promise.resolve([]),
        firebaseService.isConfigured() ? firebaseService.listClients() : Promise.resolve([]),
        jsonService.getParams().catch(() => null),
      ])
      setFactures(Array.isArray(f) ? f : [])
      setClients(Array.isArray(cl) ? cl : [])
      setSociete(params?.societe || null)
    } catch (e) {
      setError(e?.message || 'Erreur chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const clientName = (id) => clients.find((c) => c.id === id)?.nom ?? '—'

  const filtered = factures.filter((f) => {
    if (!filter) return true
    return (f.statut || 'en_attente') === filter
  })

  const formik = useFormik({
    initialValues: {
      statut: 'en_attente',
      date_depot: '',
      date_encaissement: '',
      type_virement: '',
    },
    validationSchema: trackSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!editRow) return
      setError(null)
      try {
        await firebaseService.updateFacture(editRow.id, {
          statut: values.statut,
          date_depot: values.date_depot ? Date.parse(values.date_depot) : null,
          date_encaissement: values.date_encaissement ? Date.parse(values.date_encaissement) : null,
          type_virement: values.type_virement || '',
        })
        setEditRow(null)
        await load()
      } catch (e) {
        setError(e?.message || 'Erreur mise à jour')
      }
    },
  })

  const openEdit = (row) => {
    setEditRow(row)
    formik.resetForm({
      values: {
        statut: row.statut || 'en_attente',
        date_depot: row.date_depot ? new Date(row.date_depot).toISOString().slice(0, 10) : '',
        date_encaissement: row.date_encaissement
          ? new Date(row.date_encaissement).toISOString().slice(0, 10)
          : '',
        type_virement: row.type_virement || '',
      },
    })
  }

  const pdfFor = (row) => {
    const cl = clients.find((c) => c.id === row.client_id)
    downloadInvoicePdf({
      societe: societe || {},
      client: cl || {},
      numero: row.numero,
      dateCreation: row.date_creation,
      lines: row.articles || [],
      totals: {
        total_ht: row.total_ht,
        tva: row.tva,
        total_ttc: row.total_ttc,
      },
    })
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Historique des factures</Typography>
        <Button component={RouterLink} to="/factures/nouvelle" variant="contained" startIcon={<AddIcon />}>
          Nouvelle facture
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="fil">Filtrer par statut</InputLabel>
          <Select
            labelId="fil"
            label="Filtrer par statut"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {STATUTS.map((s) => (
              <MenuItem key={s.value || 'all'} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">TTC</TableCell>
              <TableCell align="right" width={200}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Chargement…</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>Aucune facture.</TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.numero}</TableCell>
                  <TableCell>{formatDateISO(r.date_creation)}</TableCell>
                  <TableCell>{clientName(r.client_id)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={(r.statut || 'en_attente').replace(/_/g, ' ')}
                      color={statutColor(r.statut || 'en_attente')}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrencyEUR(r.total_ttc)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => pdfFor(r)}>
                      PDF
                    </Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(r)}>
                      Suivi
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editRow)} onClose={() => setEditRow(false)} fullWidth maxWidth="sm">
        <DialogTitle>Suivi facture</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField name="statut" label="Statut" select value={formik.values.statut} onChange={formik.handleChange} fullWidth>
                <MenuItem value="en_attente">En attente</MenuItem>
                <MenuItem value="payee">Payée</MenuItem>
                <MenuItem value="rejetee">Rejetée</MenuItem>
              </TextField>
              <TextField
                name="date_depot"
                label="Date de dépôt"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.date_depot}
                onChange={formik.handleChange}
                fullWidth
              />
              <TextField
                name="date_encaissement"
                label="Date d’encaissement"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.date_encaissement}
                onChange={formik.handleChange}
                fullWidth
              />
              <TextField
                name="type_virement"
                label="Type de virement / paiement"
                select
                value={formik.values.type_virement}
                onChange={formik.handleChange}
                fullWidth
              >
                <MenuItem value="">
                  <em>Aucun</em>
                </MenuItem>
                {VIREMENTS.filter(Boolean).map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
              {role === 'admin' ? (
                <Typography variant="caption" color="text.secondary">
                  Admin : vous pouvez valider les règles métier plus tard (champ validated_by_admin en base).
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditRow(false)}>Fermer</Button>
            <Button type="submit" variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  )
}
