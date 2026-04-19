/**
 * Méthode 1 (simple) : HT = Σ(qte × prix), TVA = HT × taux, TTC = HT + TVA
 * @param {Array<{ qte: number, prix_unitaire: number }>} lines
 * @param {number} tvaRate - ex. 0.2 pour 20 %
 */
export function computeTotalsSimple(lines, tvaRate = 0.2) {
  const total_ht = lines.reduce((s, l) => s + Number(l.qte || 0) * Number(l.prix_unitaire || 0), 0)
  const tva = total_ht * tvaRate
  const total_ttc = total_ht + tva
  return {
    total_ht,
    tva_rate: tvaRate,
    tva,
    total_ttc,
    mode: 'simple',
  }
}

/**
 * TVA par catégorie : chaque ligne a categorie_id ; map id -> taux (0–1)
 * @param {Array<{ qte: number, prix_unitaire: number, categorie_id?: number }>} lines
 * @param {Record<number, number>} categoryTvaById - ex. { 1: 0.2, 2: 0.1 }
 */
export function computeTotalsByCategory(lines, categoryTvaById) {
  let total_ht = 0
  let tva = 0
  for (const l of lines) {
    const lineHt = Number(l.qte || 0) * Number(l.prix_unitaire || 0)
    const rate =
      l.categorie_id != null && categoryTvaById[l.categorie_id] != null
        ? Number(categoryTvaById[l.categorie_id])
        : 0.2
    total_ht += lineHt
    tva += lineHt * rate
  }
  const total_ttc = total_ht + tva
  return {
    total_ht,
    tva,
    total_ttc,
    mode: 'category',
  }
}
