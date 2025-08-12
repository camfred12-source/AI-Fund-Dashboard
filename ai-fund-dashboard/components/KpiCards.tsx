"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import type { KpiData } from "@/lib/types"
import { formatCurrency, formatPercent } from "@/lib/numberFormat"

interface KpiCardsProps {
  kpis: KpiData
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const { portfolioValue, totalPnL, totalPnLPercent, weeklyChange } = kpis

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
        </CardContent>
      </Card>

      {/* Total P/L */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P/L vs Start</CardTitle>
          {totalPnL >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(totalPnL)}
          </div>
          <p className={`text-xs ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercent(totalPnLPercent)}
          </p>
        </CardContent>
      </Card>

      {/* 1-Week Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">1-Week Change</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {weeklyChange !== null ? (
            <>
              <div className={`text-2xl font-bold ${weeklyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatPercent(weeklyChange)}
              </div>
              {weeklyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mt-1" />
              )}
            </>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">–</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
