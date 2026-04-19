import React from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { jsonService } from '../../services/jsonService.js'

const schema = yup.object({
  nom: yup.string().required('Nom requis'),
  tva: yup.number().min(0).max(1).required('TVA requise (0–1, ex. 0.2 pour 20 %)'),
})

export default function AdminCategoriesPage() {
  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const c = await jsonService.listCategories()
      setRows(Array.isArray(c) ? c : [])
    } catch (e) {
      setError(
        e?.message ||
          'Impossible de joindre JSON Server (npx json-server --watch db.json --port 3001)',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const formik = useFormik({
    initialValues: { nom: '', tva: 0.2 },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setError(null)
      try {
        const payload = { nom: values.nom.trim(), tva: Number(values.tva) }
        if (editingId != null) await jsonService.updateCategory(editingId, { ...payload, id: editingId })
        else await jsonService.createCategory(payload)
        resetForm()
        setEditingId(null)
        setDialogOpen(false)
        await load()
      } catch (e) {
        setError(e?.message || 'Erreur enregistrement')
      }
    },
  })

  const openCreate = () => {
    setEditingId(null)
    formik.resetForm({ values: { nom: '', tva: 0.2 } })
    setDialogOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    formik.resetForm({
      values: { nom: row.nom || '', tva: row.tva ?? 0.2 },
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return
    setError(null)
    try {
      await jsonService.deleteCategory(id)
      await load()
    } catch (e) {
      setError(e?.message || 'Erreur suppression')
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Catégories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Ajouter
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell align="right">TVA</TableCell>
              <TableCell align="right" width={120}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3}>Chargement…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>Aucune catégorie.</TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.nom}</TableCell>
                  <TableCell align="right">{Math.round(Number(r.tva) * 100)} %</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)} aria-label="modifier">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(r.id)} aria-label="supprimer">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId != null ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                name="nom"
                label="Nom"
                value={formik.values.nom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nom && Boolean(formik.errors.nom)}
                helperText={formik.touched.nom ? formik.errors.nom : ''}
                fullWidth
              />
              <TextField
                name="tva"
                label="Taux TVA (décimal)"
                type="number"
                inputProps={{ step: '0.01', min: 0, max: 1 }}
                value={formik.values.tva}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tva && Boolean(formik.errors.tva)}
                helperText={
                  formik.touched.tva
                    ? formik.errors.tva
                    : 'Ex. 0.2 = 20 %, 0.1 = 10 %, 0 = exonéré'
                }
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  )
}
