"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Position } from "@/lib/types"
import { formatPercent } from "@/lib/numberFormat"

interface WeightsBarProps {
  positions: Position[]
}

export function WeightsBar({ positions }: WeightsBarProps) {
  const chartData = positions
    .filter((pos) => pos.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((pos) => ({
      ticker: pos.ticker,
      weight: pos.weight,
      name: pos.name,
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">{data.name}</p>
          <p className="text-sm text-blue-600">Weight: {formatPercent(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Weights</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="ticker"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="weight" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>No weight data available</p>
              <p className="text-sm mt-1">Add your Positions CSV URL to see the chart</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
