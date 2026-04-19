import React from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SaveIcon from '@mui/icons-material/Save'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { firebaseService } from '../services/firebaseService.js'
import { jsonService } from '../services/jsonService.js'
import { computeTotalsByCategory, computeTotalsSimple } from '../utils/invoiceCalculations.js'
import { downloadInvoicePdf } from '../utils/pdfInvoice.js'
import { formatCurrencyEUR } from '../utils/format.js'

const emptyLine = () => ({
  article_id: '',
  designation: '',
  qte: 1,
  prix_unitaire: 0,
  categorie_id: null,
})

export default function InvoiceCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = React.useState([])
  const [articles, setArticles] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const [clientId, setClientId] = React.useState('')
  const [tvaMode, setTvaMode] = React.useState('simple')
  const [lines, setLines] = React.useState([emptyLine()])
  const [societe, setSociete] = React.useState(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        const [cl, ar, ca, params] = await Promise.all([
          firebaseService.isConfigured() ? firebaseService.listClients() : Promise.resolve([]),
          jsonService.listArticles().catch(() => []),
          jsonService.listCategories().catch(() => []),
          jsonService.getParams().catch(() => null),
        ])
        if (cancelled) return
        setClients(cl)
        setArticles(Array.isArray(ar) ? ar : [])
        setCategories(Array.isArray(ca) ? ca : [])
        setSociete(params?.societe || null)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Erreur chargement')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const categoryTvaById = React.useMemo(() => {
    const m = {}
    for (const c of categories) m[c.id] = Number(c.tva)
    return m
  }, [categories])

  const linesForCalc = React.useMemo(
    () =>
      lines.map((l) => ({
        qte: Number(l.qte) || 0,
        prix_unitaire: Number(l.prix_unitaire) || 0,
        categorie_id: l.categorie_id != null ? Number(l.categorie_id) : null,
      })),
    [lines],
  )

  const totals = React.useMemo(() => {
    if (tvaMode === 'simple') return computeTotalsSimple(linesForCalc, 0.2)
    return computeTotalsByCategory(linesForCalc, categoryTvaById)
  }, [linesForCalc, tvaMode, categoryTvaById])

  const selectedClient = clients.find((c) => c.id === clientId)

  const handleArticlePick = (index, articleId) => {
    const art = articles.find((a) => String(a.id) === String(articleId))
    setLines((prev) => {
      const next = [...prev]
      const row = { ...next[index] }
      if (art) {
        row.article_id = art.id
        row.designation = art.designation
        row.prix_unitaire = art.prix_unitaire
        row.categorie_id = art.categorie_id
      } else {
        row.article_id = ''
        row.designation = ''
        row.prix_unitaire = 0
        row.categorie_id = null
      }
      next[index] = row
      return next
    })
  }

  const updateLine = (index, field, value) => {
    setLines((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index))

  const buildPayload = () => {
    const numero = `FAC-${Date.now()}`
    const articlesPayload = linesForCalc
      .map((l, i) => ({
        article_id: lines[i].article_id || null,
        designation: lines[i].designation || 'Ligne',
        qte: l.qte,
        prix_unitaire: l.prix_unitaire,
        categorie_id: l.categorie_id,
      }))
      .filter((l) => l.qte > 0 && l.prix_unitaire >= 0)

    return {
      numero,
      date_creation: Date.now(),
      client_id: clientId,
      articles: articlesPayload,
      total_ht: totals.total_ht,
      tva: totals.tva,
      total_ttc: totals.total_ttc,
      tva_mode: tvaMode,
      statut: 'en_attente',
      date_depot: null,
      date_encaissement: null,
      type_virement: '',
      validated_by_admin: false,
      created_by_uid: user?.uid || null,
    }
  }

  const handleSave = async () => {
    if (!clientId) {
      setError('Sélectionnez un client.')
      return
    }
    if (!linesForCalc.some((l) => l.qte > 0 && l.prix_unitaire >= 0)) {
      setError('Ajoutez au moins une ligne valide.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await firebaseService.createFacture(buildPayload())
      navigate('/factures', { replace: true })
    } catch (e) {
      setError(e?.message || 'Erreur enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handlePdf = () => {
    if (!clientId) {
      setError('Sélectionnez un client pour le PDF.')
      return
    }
    const payload = buildPayload()
    downloadInvoicePdf({
      societe: societe || {},
      client: selectedClient || {},
      numero: payload.numero,
      dateCreation: payload.date_creation,
      lines: payload.articles,
      totals: {
        total_ht: totals.total_ht,
        tva: totals.tva,
        total_ttc: totals.total_ttc,
      },
    })
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Nouvelle facture</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? (
        <Typography>Chargement…</Typography>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Client"
                select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="">
                  <em>Choisir…</em>
                </MenuItem>
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nom} — {c.email}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="subtitle2">Mode de calcul TVA</Typography>
              <RadioGroup row value={tvaMode} onChange={(e) => setTvaMode(e.target.value)}>
                <FormControlLabel value="simple" control={<Radio />} label="Simple (TVA 20 % sur le HT total)" />
                <FormControlLabel
                  value="category"
                  control={<Radio />}
                  label="Par catégorie (taux JSON Server)"
                />
              </RadioGroup>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Lignes</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addLine}>
                Ligne
              </Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Article</TableCell>
                  <TableCell>Désignation</TableCell>
                  <TableCell width={100}>Qté</TableCell>
                  <TableCell width={120} align="right">
                    P.U.
                  </TableCell>
                  <TableCell width={120} align="right">
                    Montant HT
                  </TableCell>
                  <TableCell width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, index) => {
                  const ht = Number(line.qte || 0) * Number(line.prix_unitaire || 0)
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={line.article_id === '' ? '' : String(line.article_id)}
                          onChange={(e) => handleArticlePick(index, e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Manuel</em>
                          </MenuItem>
                          {articles.map((a) => (
                            <MenuItem key={a.id} value={String(a.id)}>
                              {a.designation}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={line.designation}
                          onChange={(e) => updateLine(index, 'designation', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          value={line.qte}
                          onChange={(e) => updateLine(index, 'qte', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: '0.01' }}
                          value={line.prix_unitaire}
                          onChange={(e) => updateLine(index, 'prix_unitaire', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrencyEUR(ht)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => removeLine(index)}
                          disabled={lines.length <= 1}
                          aria-label="supprimer ligne"
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1} alignItems="flex-end">
              <Typography>Total HT : {formatCurrencyEUR(totals.total_ht)}</Typography>
              <Typography>TVA : {formatCurrencyEUR(totals.tva)}</Typography>
              <Typography variant="h6">Total TTC : {formatCurrencyEUR(totals.total_ttc)}</Typography>
            </Stack>
          </Paper>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || !firebaseService.isConfigured()}
            >
              Enregistrer
            </Button>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handlePdf}>
              Aperçu PDF
            </Button>
          </Stack>
          {!firebaseService.isConfigured() ? (
            <Alert severity="warning">Firebase requis pour enregistrer la facture.</Alert>
          ) : null}
        </>
      )}
    </Stack>
  )
}
