import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrencyEUR, formatDateISO } from './format.js'

/**
 * @param {object} opts
 * @param {{ nom?: string, adresse?: string, email?: string, tel?: string }} opts.societe
 * @param {{ nom?: string, adresse?: string, email?: string, tel?: string }} opts.client
 * @param {string} opts.numero
 * @param {string|number} opts.dateCreation
 * @param {Array<{ designation: string, qte: number, prix_unitaire: number }>} opts.lines
 * @param {{ total_ht: number, tva: number, total_ttc: number }} opts.totals
 */
export function downloadInvoicePdf(opts) {
  const {
    societe = {},
    client = {},
    numero = '—',
    dateCreation,
    lines = [],
    totals = { total_ht: 0, tva: 0, total_ttc: 0 },
  } = opts

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFontSize(18)
  doc.text(societe.nom || 'Entreprise', 14, 18)

  doc.setFontSize(10)
  let y = 26
  const socLines = [societe.adresse, societe.email, societe.tel].filter(Boolean)
  for (const t of socLines) {
    doc.text(String(t), 14, y)
    y += 5
  }

  doc.setFontSize(12)
  doc.text(`Facture ${numero}`, pageW - 14, 18, { align: 'right' })
  doc.setFontSize(10)
  doc.text(`Date : ${formatDateISO(dateCreation)}`, pageW - 14, 26, { align: 'right' })

  y = Math.max(y, 40)
  doc.setFontSize(11)
  doc.text('Client', 14, y)
  y += 6
  doc.setFontSize(10)
  const cli = [client.nom, client.adresse, client.email, client.tel].filter(Boolean)
  for (const t of cli) {
    doc.text(String(t), 14, y)
    y += 5
  }
  y += 6

  const body = lines.map((l) => [
    l.designation || '—',
    String(l.qte ?? ''),
    formatCurrencyEUR(l.prix_unitaire),
    formatCurrencyEUR(Number(l.qte || 0) * Number(l.prix_unitaire || 0)),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Désignation', 'Qté', 'P.U.', 'Montant HT']],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  })

  const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : y + 40
  doc.setFontSize(10)
  doc.text(`Total HT : ${formatCurrencyEUR(totals.total_ht)}`, pageW - 14, finalY, { align: 'right' })
  doc.text(`TVA : ${formatCurrencyEUR(totals.tva)}`, pageW - 14, finalY + 6, { align: 'right' })
  doc.setFontSize(11)
  doc.text(`Total TTC : ${formatCurrencyEUR(totals.total_ttc)}`, pageW - 14, finalY + 14, {
    align: 'right',
  })

  doc.setFontSize(9)
  doc.text('Signature', 14, doc.internal.pageSize.getHeight() - 20)

  doc.save(`facture-${numero}.pdf`)
}
