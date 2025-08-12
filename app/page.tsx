"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingsCard } from "@/components/SettingsCard"
import { KpiCards } from "@/components/KpiCards"
import { PerformanceChart } from "@/components/PerformanceChart"
import { AllocationPie } from "@/components/AllocationPie"
import { WeightsBar } from "@/components/WeightsBar"
import { HoldingsTable } from "@/components/HoldingsTable"
import { SetupCard } from "@/components/SetupCard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Newspaper } from "lucide-react"
import type { Position, HistoryEntry, DashboardSettings, KpiData } from "@/lib/types"
import { parseCsv, findHeader } from "@/lib/parseCsv"
import { parseNumber } from "@/lib/numberFormat"
import { parseDate, getDaysAgo } from "@/lib/date"

const DEFAULT_SETTINGS: DashboardSettings = {
  positionsUrl: "",
  historyUrl: "",
  startingValue: 276.56,
}

export default function Dashboard() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS)
  const [positions, setPositions] = useState<Position[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai-fund-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (e) {
        console.error("Failed to parse saved settings:", e)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: DashboardSettings) => {
    setSettings(newSettings)
    localStorage.setItem("ai-fund-settings", JSON.stringify(newSettings))
  }, [])

  // Fetch and parse CSV data
  const fetchData = useCallback(async () => {
    if (!settings.positionsUrl && !settings.historyUrl) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const promises: Promise<any>[] = []

      if (settings.positionsUrl) {
        promises.push(
          fetch(settings.positionsUrl, { cache: "no-store" })
            .then((res) => res.text())
            .then((text) => ({ type: "positions", data: text })),
        )
      }

      if (settings.historyUrl) {
        promises.push(
          fetch(settings.historyUrl, { cache: "no-store" })
            .then((res) => res.text())
            .then((text) => ({ type: "history", data: text })),
        )
      }

      const results = await Promise.all(promises)

      // Process positions
      const positionsResult = results.find((r) => r.type === "positions")
      if (positionsResult) {
        const parsed = parseCsv(positionsResult.data)
        const newPositions = parsePositions(parsed)
        setPositions(newPositions)
      }

      // Process history
      const historyResult = results.find((r) => r.type === "history")
      if (historyResult) {
        const parsed = parseCsv(historyResult.data)
        const newHistory = parseHistory(parsed)
        setHistory(newHistory)
      }

      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [settings.positionsUrl, settings.historyUrl])

  // Parse positions CSV
  const parsePositions = (parsed: ReturnType<typeof parseCsv>): Position[] => {
    const tickerHeader = findHeader(parsed.headers, ["ticker", "symbol"])
    const nameHeader = findHeader(parsed.headers, ["name", "company"])
    const sharesHeader = findHeader(parsed.headers, ["shares", "quantity"])
    const priceHeader = findHeader(parsed.headers, ["price", "last"])
    const marketValueHeader = findHeader(parsed.headers, ["marketvalue", "value"])
    const weightHeader = findHeader(parsed.headers, ["weight", "alloc"])

    if (!tickerHeader || !nameHeader || !sharesHeader || !priceHeader) {
      throw new Error("Missing required position headers")
    }

    const positions: Position[] = parsed.rows.map((row) => {
      const shares = parseNumber(row[sharesHeader])
      const price = parseNumber(row[priceHeader])
      const marketValue = marketValueHeader ? parseNumber(row[marketValueHeader]) : shares * price

      return {
        ticker: row[tickerHeader],
        name: row[nameHeader],
        shares,
        price,
        marketValue,
        weight: 0, // Will be recalculated
      }
    })

    // Recalculate weights
    const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
    positions.forEach((pos) => {
      pos.weight = totalValue > 0 ? (pos.marketValue / totalValue) * 100 : 0
    })

    return positions
  }

  // Parse history CSV
  const parseHistory = (parsed: ReturnType<typeof parseCsv>): HistoryEntry[] => {
    const dateHeader = findHeader(parsed.headers, ["date", "datetime"])
    const valueHeader = findHeader(parsed.headers, ["portfoliovalue", "total", "value", "equity"])

    if (!dateHeader || !valueHeader) {
      throw new Error("Missing required history headers")
    }

    const history: HistoryEntry[] = parsed.rows
      .map((row) => {
        const date = parseDate(row[dateHeader])
        const portfolioValue = parseNumber(row[valueHeader])

        if (!date || portfolioValue === 0) return null

        return { date, portfolioValue }
      })
      .filter((entry): entry is HistoryEntry => entry !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    return history
  }

  // Calculate KPIs
  const calculateKpis = (): KpiData => {
    let portfolioValue = 0

    if (history.length > 0) {
      portfolioValue = history[history.length - 1].portfolioValue
    } else if (positions.length > 0) {
      portfolioValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
    }

    const totalPnL = portfolioValue - settings.startingValue
    const totalPnLPercent = settings.startingValue > 0 ? (totalPnL / settings.startingValue) * 100 : 0

    let weeklyChange: number | null = null
    if (history.length > 1) {
      const latest = history[history.length - 1]
      const weekAgo = getDaysAgo(latest.date, 7)

      // Find closest entry to 7 days ago
      const weekAgoEntry = history
        .filter((entry) => entry.date <= weekAgo)
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0]

      if (weekAgoEntry && weekAgoEntry.portfolioValue > 0) {
        weeklyChange = ((latest.portfolioValue - weekAgoEntry.portfolioValue) / weekAgoEntry.portfolioValue) * 100
      }
    }

    return {
      portfolioValue,
      totalPnL,
      totalPnLPercent,
      weeklyChange,
    }
  }

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (settings.positionsUrl || settings.historyUrl) {
      fetchData()
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [fetchData, settings.positionsUrl, settings.historyUrl])

  const kpis = calculateKpis()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Fund – Live</h1>
          <p className="text-gray-600 mt-2">Real-time portfolio dashboard</p>
          <div className="mt-4">
            <Link href="/news">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Newspaper className="h-4 w-4" />
                Latest AI News
              </Button>
            </Link>
          </div>
        </div>

        <SettingsCard
          settings={settings}
          onSave={saveSettings}
          onRefresh={fetchData}
          loading={loading}
          lastUpdated={lastUpdated}
          error={error}
        />

        <KpiCards kpis={kpis} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceChart history={history} />
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AllocationPie positions={positions} />
              <WeightsBar positions={positions} />
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-6">
            <HoldingsTable positions={positions} />
          </TabsContent>
        </Tabs>

        <SetupCard />
      </div>
    </div>
  )
}
