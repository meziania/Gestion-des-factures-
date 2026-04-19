/** Montants et dates (factures, PDF, tableaux). */
export function formatCurrencyEUR(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

export function formatDateISO(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(d)
}
