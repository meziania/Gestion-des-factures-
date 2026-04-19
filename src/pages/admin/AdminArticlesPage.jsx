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
import MenuItem from '@mui/material/MenuItem'
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
import { formatCurrencyEUR } from '../../utils/format.js'

const schema = yup.object({
  designation: yup.string().required('Désignation requise'),
  prix_unitaire: yup.number().min(0, 'Prix ≥ 0').required(),
  categorie_id: yup
    .mixed()
    .test('cat', 'Catégorie requise', (v) => v !== '' && v != null)
    .transform((v) => (v === '' ? undefined : Number(v))),
})

export default function AdminArticlesPage() {
  const [articles, setArticles] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const [a, c] = await Promise.all([jsonService.listArticles(), jsonService.listCategories()])
      setArticles(Array.isArray(a) ? a : [])
      setCategories(Array.isArray(c) ? c : [])
    } catch (e) {
      setError(
        e?.message ||
          'Impossible de joindre JSON Server (lancez : npx json-server --watch db.json --port 3001)',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const formik = useFormik({
    initialValues: { designation: '', prix_unitaire: 0, categorie_id: '' },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setError(null)
      try {
        const payload = {
          designation: values.designation.trim(),
          prix_unitaire: Number(values.prix_unitaire),
          categorie_id: Number(values.categorie_id),
        }
        if (editingId != null) {
          await jsonService.updateArticle(editingId, { ...payload, id: editingId })
        } else {
          await jsonService.createArticle(payload)
        }
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
    formik.resetForm({
      values: { designation: '', prix_unitaire: 0, categorie_id: categories[0]?.id ?? '' },
    })
    setDialogOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    formik.resetForm({
      values: {
        designation: row.designation || '',
        prix_unitaire: row.prix_unitaire ?? 0,
        categorie_id: row.categorie_id ?? '',
      },
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return
    setError(null)
    try {
      await jsonService.deleteArticle(id)
      await load()
    } catch (e) {
      setError(e?.message || 'Erreur suppression')
    }
  }

  const catName = (id) => categories.find((c) => c.id === id)?.nom ?? '—'

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Articles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Ajouter
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Désignation</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Prix unitaire</TableCell>
              <TableCell align="right" width={120}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Chargement…</TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Aucun article.</TableCell>
              </TableRow>
            ) : (
              articles.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.designation}</TableCell>
                  <TableCell>{catName(r.categorie_id)}</TableCell>
                  <TableCell align="right">{formatCurrencyEUR(r.prix_unitaire)}</TableCell>
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
        <DialogTitle>{editingId != null ? 'Modifier l’article' : 'Nouvel article'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                name="designation"
                label="Désignation"
                value={formik.values.designation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.designation && Boolean(formik.errors.designation)}
                helperText={formik.touched.designation ? formik.errors.designation : ''}
                fullWidth
              />
              <TextField
                name="prix_unitaire"
                label="Prix unitaire (€)"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                value={formik.values.prix_unitaire}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.prix_unitaire && Boolean(formik.errors.prix_unitaire)}
                helperText={formik.touched.prix_unitaire ? formik.errors.prix_unitaire : ''}
                fullWidth
              />
              <TextField
                name="categorie_id"
                label="Catégorie"
                select
                value={formik.values.categorie_id}
                onChange={formik.handleChange}
                fullWidth
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nom}
                  </MenuItem>
                ))}
              </TextField>
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
