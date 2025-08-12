"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw, Save } from "lucide-react"
import type { DashboardSettings } from "@/lib/types"
import { formatTime } from "@/lib/date"

interface SettingsCardProps {
  settings: DashboardSettings
  onSave: (settings: DashboardSettings) => void
  onRefresh: () => void
  loading: boolean
  lastUpdated: Date | null
  error: string | null
}

export function SettingsCard({ settings, onSave, onRefresh, loading, lastUpdated, error }: SettingsCardProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSave(localSettings)
    onRefresh()
  }

  const hasUrls = localSettings.positionsUrl || localSettings.historyUrl

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Settings</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {lastUpdated && <span>Last updated {formatTime(lastUpdated)}</span>}
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="positions-url">Positions CSV URL</Label>
            <Input
              id="positions-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
              value={localSettings.positionsUrl}
              onChange={(e) => setLocalSettings((prev) => ({ ...prev, positionsUrl: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="history-url">History CSV URL</Label>
            <Input
              id="history-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
              value={localSettings.historyUrl}
              onChange={(e) => setLocalSettings((prev) => ({ ...prev, historyUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="starting-value">Starting Value (USD)</Label>
          <Input
            id="starting-value"
            type="number"
            step="0.01"
            min="0"
            placeholder="276.56"
            value={localSettings.startingValue}
            onChange={(e) =>
              setLocalSettings((prev) => ({
                ...prev,
                startingValue: Number.parseFloat(e.target.value) || 0,
              }))
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save & Refresh
          </Button>

          {hasUrls && (
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">Error: {error}</div>}

        {!hasUrls && !loading && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
            💡 Paste your CSV links above and click "Save & Refresh" to start loading data.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
