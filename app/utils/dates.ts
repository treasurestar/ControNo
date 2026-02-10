export function formatDateToBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatDateShort(dateStr: string): string {
  const [_year, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

export function formatDateToInput(date: Date): string {
  return date.toISOString().split('T')[0]
}
