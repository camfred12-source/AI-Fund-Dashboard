"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Position } from "@/lib/types"
import { formatCurrency, formatPercent, formatShares } from "@/lib/numberFormat"

interface HoldingsTableProps {
  positions: Position[]
}

export function HoldingsTable({ positions }: HoldingsTableProps) {
  const sortedPositions = [...positions].sort((a, b) => b.marketValue - a.marketValue)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedPositions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Price (USD)</TableHead>
                  <TableHead className="text-right">Market Value (USD)</TableHead>
                  <TableHead className="text-right">Weight (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPositions.map((position, index) => (
                  <TableRow key={`${position.ticker}-${index}`}>
                    <TableCell className="font-medium">{position.ticker}</TableCell>
                    <TableCell className="max-w-xs truncate" title={position.name}>
                      {position.name}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatShares(position.shares)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(position.price)}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(position.marketValue)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatPercent(position.weight)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-medium bg-gray-50">
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(sortedPositions.reduce((sum, pos) => sum + pos.marketValue, 0))}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPercent(sortedPositions.reduce((sum, pos) => sum + pos.weight, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div>
              <p className="text-lg">No holdings data available</p>
              <p className="text-sm mt-2">Add your Positions CSV URL in the settings above to see your holdings</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
