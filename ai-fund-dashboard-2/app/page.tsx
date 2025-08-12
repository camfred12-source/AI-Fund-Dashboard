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
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [dataStatus, setDataStatus] = useState<{
    positionsLoaded: boolean
    historyLoaded: boolean
    positionsError?: string
    historyError?: string
  }>({
    positionsLoaded: false,
    historyLoaded: false,
  })

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
    setFetchError(null)
    setDataStatus({
      positionsLoaded: false,
      historyLoaded: false,
    })

    try {
      const promises: Promise<any>[] = []

      if (positionsUrl) {
        promises.push(
          fetch(positionsUrl, { cache: "no-store" })
            .then((res) => {
              if (!res.ok) throw new Error(`Positions CSV fetch failed: ${res.status} ${res.statusText}`)
              return res.text()
            })
            .then((text) => ({ type: "positions", data: text }))
            .catch((err) => ({ type: "positions", error: err.message })),
        )
      }

      if (historyUrl) {
        promises.push(
          fetch(historyUrl, { cache: "no-store" })
            .then((res) => {
              if (!res.ok) throw new Error(`History CSV fetch failed: ${res.status} ${res.statusText}`)
              return res.text()
            })
            .then((text) => ({ type: "history", data: text }))
            .catch((err) => ({ type: "history", error: err.message })),
        )
      }

      const results = await Promise.all(promises)
      const newStatus = { ...dataStatus }

      // Process positions
      const positionsResult = results.find((r) => r.type === "positions")
      if (positionsResult) {
        if (positionsResult.error) {
          newStatus.positionsError = positionsResult.error
        } else {
          try {
            const parsed = parseCsv(positionsResult.data)
            const newPositions = parsePositions(parsed)
            setPositions(newPositions)
            newStatus.positionsLoaded = true
          } catch (err) {
            newStatus.positionsError = err instanceof Error ? err.message : "Failed to parse positions CSV"
          }
        }
      }

      // Process history
      const historyResult = results.find((r) => r.type === "history")
      if (historyResult) {
        if (historyResult.error) {
          newStatus.historyError = historyResult.error
        } else {
          try {
            const parsed = parseCsv(historyResult.data)
            const newHistory = parseHistory(parsed)
            setHistory(newHistory)
            newStatus.historyLoaded = true
          } catch (err) {
            newStatus.historyError = err instanceof Error ? err.message : "Failed to parse history CSV"
          }
        }
      }

      setDataStatus(newStatus)
      setLastUpdated(new Date())
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [positionsUrl, historyUrl])

  // Parse positions CSV
  const parsePositions = (parsed: ReturnType<typeof parseCsv>): Position[] => {
    console.log("Parsing positions - Headers:", parsed.headers)
    console.log("Parsing positions - Row count:", parsed.rows.length)

    const tickerHeader = findHeader(parsed.headers, ["ticker", "symbol"])
    const nameHeader = findHeader(parsed.headers, ["name", "company"])
    const sharesHeader = findHeader(parsed.headers, ["shares", "quantity"])
    const priceHeader = findHeader(parsed.headers, ["price", "last"])
    const marketValueHeader = findHeader(parsed.headers, ["marketvalue", "value"])
    const weightHeader = findHeader(parsed.headers, ["weight", "alloc"])

    console.log("Found headers:", {
      ticker: tickerHeader,
      name: nameHeader,
      shares: sharesHeader,
      price: priceHeader,
      marketValue: marketValueHeader,
      weight: weightHeader,
    })

    if (!tickerHeader || !nameHeader || !sharesHeader || !priceHeader) {
      const missingHeaders = []
      if (!tickerHeader) missingHeaders.push("ticker/symbol")
      if (!nameHeader) missingHeaders.push("name/company")
      if (!sharesHeader) missingHeaders.push("shares/quantity")
      if (!priceHeader) missingHeaders.push("price/last")

      throw new Error(
        `Missing required position headers: ${missingHeaders.join(", ")}. Available headers: ${parsed.headers.join(", ")}`,
      )
    }

    const positions: Position[] = parsed.rows.map((row, index) => {
      const shares = parseNumber(row[sharesHeader])
      const price = parseNumber(row[priceHeader])
      const marketValue = marketValueHeader ? parseNumber(row[marketValueHeader]) : shares * price

      console.log(`Position ${index}:`, {
        ticker: row[tickerHeader],
        shares,
        price,
        marketValue,
      })

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
    console.log("Total portfolio value:", totalValue)

    positions.forEach((pos) => {
      pos.weight = totalValue > 0 ? (pos.marketValue / totalValue) * 100 : 0
    })

    console.log("Final positions:", positions)
    return positions
  }

  // Parse history CSV
  const parseHistory = (parsed: ReturnType<typeof parseCsv>): HistoryEntry[] => {
    console.log("Parsing history - Headers:", parsed.headers)
    console.log("Parsing history - Row count:", parsed.rows.length)

    const dateHeader = findHeader(parsed.headers, ["date", "datetime"])
    const valueHeader = findHeader(parsed.headers, ["portfoliovalue", "total", "value", "equity"])

    console.log("Found headers:", {
      date: dateHeader,
      value: valueHeader,
    })

    if (!dateHeader || !valueHeader) {
      const missingHeaders = []
      if (!dateHeader) missingHeaders.push("date/datetime")
      if (!valueHeader) missingHeaders.push("portfoliovalue/total/value/equity")

      throw new Error(
        `Missing required history headers: ${missingHeaders.join(", ")}. Available headers: ${parsed.headers.join(", ")}`,
      )
    }

    const history: HistoryEntry[] = parsed.rows
      .map((row, index) => {
        const date = parseDate(row[dateHeader])
        const portfolioValue = parseNumber(row[valueHeader])

        if (index < 3) {
          // Log first few entries for debugging
          console.log(`History ${index}:`, {
            rawDate: row[dateHeader],
            parsedDate: date,
            rawValue: row[valueHeader],
            parsedValue: portfolioValue,
          })
        }

        if (!date || portfolioValue === 0) return null

        return { date, portfolioValue }
      })
      .filter((entry): entry is HistoryEntry => entry !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    console.log("Final history entries:", history.length)
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

      {hasData && loading && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>Loading portfolio data...</AlertDescription>
        </Alert>
      )}

      {hasData && (fetchError || dataStatus.positionsError || dataStatus.historyError) && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              {fetchError && <div>General error: {fetchError}</div>}
              {dataStatus.positionsError && <div>Positions error: {dataStatus.positionsError}</div>}
              {dataStatus.historyError && <div>History error: {dataStatus.historyError}</div>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasData && !loading && !fetchError && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription>
            <div className="flex gap-4 text-sm">
              <span>Positions: {dataStatus.positionsLoaded ? `✓ ${positions.length} loaded` : "✗ Not loaded"}</span>
              <span>History: {dataStatus.historyLoaded ? `✓ ${history.length} entries` : "✗ Not loaded"}</span>
            </div>
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
    </div>
  )
}
