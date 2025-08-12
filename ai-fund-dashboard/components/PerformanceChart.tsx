"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { HistoryEntry } from "@/lib/types"
import { formatCurrency } from "@/lib/numberFormat"

interface PerformanceChartProps {
  history: HistoryEntry[]
}

export function PerformanceChart({ history }: PerformanceChartProps) {
  const chartData = history.map((entry) => ({
    date: entry.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: history.length > 30 ? undefined : "numeric",
    }),
    value: entry.portfolioValue,
    fullDate: entry.date.toLocaleDateString("en-US"),
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-blue-600">Value: {formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No performance data available</p>
              <p className="text-sm mt-1">Add your History CSV URL to see the chart</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
