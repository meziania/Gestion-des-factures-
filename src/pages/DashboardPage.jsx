import React from 'react'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext.jsx'
import { firebaseService } from '../services/firebaseService.js'
import { formatCurrencyEUR } from '../utils/format.js'

function KpiCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: '1 1 160px', minWidth: 140 }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{value}</Typography>
    </Paper>
  )
}

function monthKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [factures, setFactures] = React.useState([])
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      if (!firebaseService.isConfigured()) {
        setLoading(false)
        return
      }
      try {
        const list = await firebaseService.listFactures()
        if (!cancelled) setFactures(Array.isArray(list) ? list : [])
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Erreur')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const mine = React.useMemo(
    () => factures.filter((f) => !user?.uid || f.created_by_uid === user.uid),
    [factures, user?.uid],
  )

  const totalCount = mine.length
  const totalEncaisse = mine
    .filter((f) => f.statut === 'payee')
    .reduce((s, f) => s + Number(f.total_ttc || 0), 0)
  const enAttente = mine.filter((f) => (f.statut || 'en_attente') === 'en_attente').length
  const rejetees = mine.filter((f) => f.statut === 'rejetee').length

  const chartData = React.useMemo(() => {
    const byMonth = {}
    for (const f of mine) {
      if (f.statut !== 'payee' || !f.date_creation) continue
      const k = monthKey(f.date_creation)
      byMonth[k] = (byMonth[k] || 0) + Number(f.total_ttc || 0)
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
  }, [mine])

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Mon tableau de bord</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? (
        <Typography>Chargement…</Typography>
      ) : (
        <>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <KpiCard label="Mes factures" value={String(totalCount)} />
            <KpiCard label="Montant encaissé (payées)" value={formatCurrencyEUR(totalEncaisse)} />
            <KpiCard label="En attente" value={String(enAttente)} />
            <KpiCard label="Rejetées" value={String(rejetees)} />
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" gutterBottom>
              Encaissements par mois (factures payées)
            </Typography>
            {chartData.length === 0 ? (
              <Typography color="text.secondary">Pas encore de données.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrencyEUR(v)} />
                  <Bar dataKey="total" fill="#1976d2" name="Montant" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </>
      )}
    </Stack>
  )
}
