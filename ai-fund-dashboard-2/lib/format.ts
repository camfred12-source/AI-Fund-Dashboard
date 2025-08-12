export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  return date.toLocaleDateString()
}

export function clampText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text
  }

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "..."
  }

  return truncated + "..."
}

export function isRecent(dateString: string, hoursThreshold = 24): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  return diffInHours <= hoursThreshold
}

export function filterByDays(items: any[], days: number): any[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return items.filter((item) => {
    const itemDate = new Date(item.pubDate)
    return itemDate >= cutoffDate
  })
}
