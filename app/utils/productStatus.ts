import type { ProductStatus } from '~~/shared/types'

export function getProductStatus(expirationDate: string): ProductStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expDate = new Date(expirationDate + 'T00:00:00')
  const diffTime = expDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'vencido'
  if (diffDays <= 5) return 'vencendo'
  return 'ok'
}

export function statusLabel(status: ProductStatus): string {
  if (status === 'ok') return 'OK'
  if (status === 'vencendo') return 'Vencendo'
  return 'Vencido'
}

export function dateDiffDays(start: string, end: string): number {
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}
