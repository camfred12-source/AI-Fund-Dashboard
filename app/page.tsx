"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KpiCards } from "@/components/KpiCards"
import { PerformanceChart } from "@/components/PerformanceChart"
import { AllocationPie } from "@/components/AllocationPie"
import { WeightsBar } from "@/components/WeightsBar"
import { HoldingsTable } from "@/components/HoldingsTable"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Newspaper, Settings } from "lucide-react"
import type { Position, HistoryEntry, KpiData } from "@/lib/types"
import { parseCsv, findHeader } from "@/lib/parseCsv"
import { parseNumber } from "@/lib/numberFormat"
import { parseDate, getDaysAgo } from "@/lib/date"

export default function Dashboard() {
  const [positionsUrl, setPositionsUrl] = useState("")
  const [historyUrl, setHistoryUrl] = useState("")
  const [startingValue, setStartingValue] = useState(276.56)
  const [positions, setPositions] = useState<Position[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPositionsUrl(localStorage.getItem("ai_positionsUrl") || "")
      setHistoryUrl(localStorage.getItem("ai_historyUrl") || "")
      const savedStartingValue = localStorage.getItem("ai_startingValue")
      if (savedStartingValue) {
        setStartingValue(Number.parseFloat(savedStartingValue) || 276.56)
      }
    }
  }, [])

  // Fetch and parse CSV data
  const fetchData = useCallback(async () => {
    if (!positionsUrl && !historyUrl) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const promises: Promise<any>[] = []

      if (positionsUrl) {
        promises.push(
          fetch(positionsUrl, { cache: "no-store" })
            .then((res) => res.text())
            .then((text) => ({ type: "positions", data: text })),
        )
      }

      if (historyUrl) {
        promises.push(
          fetch(historyUrl, { cache: "no-store" })
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
  }, [positionsUrl, historyUrl])

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

    const totalPnL = portfolioValue - startingValue
    const totalPnLPercent = startingValue > 0 ? (totalPnL / startingValue) * 100 : 0

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
    if (positionsUrl || historyUrl) {
      fetchData()
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [fetchData, positionsUrl, historyUrl])

  const kpis = calculateKpis()
  const hasData = positionsUrl || historyUrl

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {!hasData && (
        <Alert className="border-primary/20 bg-primary/5">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">No data configured.</span>{" "}
            <Link href="/input-data" className="text-primary hover:underline font-medium">
              Add your data links in Input Data
            </Link>{" "}
            to start tracking your portfolio.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">AI Fund – Live</h1>
          <p className="text-muted-foreground text-lg">Real-time portfolio dashboard</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
          <Link href="/news">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Newspaper className="h-4 w-4" />
              Latest AI News
            </Button>
          </Link>
        </div>
      </div>

      {hasData && (
        <>
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
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
