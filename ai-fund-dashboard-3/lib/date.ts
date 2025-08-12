export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null

  // Try ISO format first
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date
  }

  // Try dd/mm/yyyy format
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy
    date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function getDaysAgo(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}
