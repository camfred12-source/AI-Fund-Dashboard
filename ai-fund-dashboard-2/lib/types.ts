export interface Position {
  ticker: string
  name: string
  shares: number
  price: number
  marketValue: number
  weight: number
}

export interface HistoryEntry {
  date: Date
  portfolioValue: number
}

export interface DashboardSettings {
  positionsUrl: string
  historyUrl: string
  startingValue: number
}

export interface KpiData {
  portfolioValue: number
  totalPnL: number
  totalPnLPercent: number
  weeklyChange: number | null
}
