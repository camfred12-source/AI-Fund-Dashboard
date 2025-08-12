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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          <DollarSign className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold tracking-tight">{formatCurrency(portfolioValue)}</div>
          <div className="h-px bg-border/30 mt-4"></div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L vs Start</CardTitle>
          {totalPnL >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-3xl font-bold tracking-tight ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(totalPnL)}
          </div>
          <p className={`text-sm font-medium mt-1 ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercent(totalPnLPercent)}
          </p>
          <div className="h-px bg-border/30 mt-4"></div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">1-Week Change</CardTitle>
          <Calendar className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="pt-0">
          {weeklyChange !== null ? (
            <>
              <div
                className={`text-3xl font-bold tracking-tight ${weeklyChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatPercent(weeklyChange)}
              </div>
              <div className="flex items-center mt-2">
                {weeklyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-muted-foreground ml-2">vs last week</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-muted-foreground tracking-tight">–</div>
              <p className="text-sm text-muted-foreground mt-2">Insufficient data</p>
            </>
          )}
          <div className="h-px bg-border/30 mt-4"></div>
        </CardContent>
      </Card>
    </div>
  )
}
