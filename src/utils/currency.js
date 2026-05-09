export const CURRENCIES = {
  GNF: {
    code: 'GNF',
    name: 'Franc Guinéen',
    symbol: 'GNF',
    flag: '🇬🇳',
    decimals: 0,
    locale: 'fr-GN',
  },
  XOF: {
    code: 'XOF',
    name: 'Franc CFA (BCEAO)',
    symbol: 'FCFA',
    flag: '🌍',
    decimals: 0,
    locale: 'fr-SN',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2,
    locale: 'fr-FR',
  },
  USD: {
    code: 'USD',
    name: 'Dollar US',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
    locale: 'en-US',
  },
}

// Taux de conversion depuis GNF (Franc Guinéen)
// 1 EUR ≈ 9 500 GNF | 1 USD ≈ 8 700 GNF | 1 EUR = 655.957 XOF (fixe)
const RATES_FROM_GNF = {
  GNF: 1,
  XOF: 0.06905,   // 1 GNF ≈ 0.069 XOF
  EUR: 0.0001053,  // 1 GNF ≈ 0.000105 EUR
  USD: 0.0001149,  // 1 GNF ≈ 0.000115 USD
}

export const convertFromGNF = (amountGNF, targetCurrency) => {
  const rate = RATES_FROM_GNF[targetCurrency] ?? 1
  return amountGNF * rate
}

export const formatPrice = (amountGNF, currency) => {
  const curr = CURRENCIES[currency] ?? CURRENCIES.GNF
  const amount = convertFromGNF(amountGNF, currency)

  if (curr.decimals === 0) {
    const rounded = Math.round(amount)
    return `${rounded.toLocaleString('fr-FR')} ${curr.symbol}`
  }
  return `${curr.symbol} ${amount.toFixed(curr.decimals).replace('.', ',')}`
}
