"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Save, TestTube, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SetupCard } from "@/components/SetupCard"

export function DataInputs() {
  const [positionsUrl, setPositionsUrl] = useState("")
  const [historyUrl, setHistoryUrl] = useState("")
  const [startingValue, setStartingValue] = useState("")
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isTestingPositions, setIsTestingPositions] = useState(false)
  const [isTestingHistory, setIsTestingHistory] = useState(false)
  const { toast } = useToast()

  // Load saved values on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPositionsUrl(localStorage.getItem("ai_positionsUrl") || "")
      setHistoryUrl(localStorage.getItem("ai_historyUrl") || "")
      setStartingValue(localStorage.getItem("ai_startingValue") || "")
    }
  }, [])

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_positionsUrl", positionsUrl)
      localStorage.setItem("ai_historyUrl", historyUrl)
      localStorage.setItem("ai_startingValue", startingValue)

      toast({
        title: "Settings saved",
        description: "Your data configuration has been saved successfully.",
      })
    }
  }

  const testCsvUrl = async (url: string, type: "positions" | "history") => {
    if (!url.trim()) {
      toast({
        title: "No URL provided",
        description: `Please enter a ${type} CSV URL to test.`,
        variant: "destructive",
      })
      return
    }

    const setTesting = type === "positions" ? setIsTestingPositions : setIsTestingHistory
    setTesting(true)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const csvText = await response.text()
      const lines = csvText.trim().split("\n")

      if (lines.length < 2) {
        throw new Error("CSV appears to be empty or has no data rows")
      }

      toast({
        title: "Test successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} CSV loaded successfully with ${lines.length - 1} data rows.`,
      })
    } catch (error) {
      toast({
        title: "Test failed",
        description: `Failed to load ${type} CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Data Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="positions-url">Positions CSV URL</Label>
              <div className="flex gap-2">
                <Input
                  id="positions-url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=..."
                  value={positionsUrl}
                  onChange={(e) => setPositionsUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testCsvUrl(positionsUrl, "positions")}
                  disabled={isTestingPositions}
                  className="shrink-0"
                >
                  {isTestingPositions ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  Test
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="history-url">History CSV URL</Label>
              <div className="flex gap-2">
                <Input
                  id="history-url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=..."
                  value={historyUrl}
                  onChange={(e) => setHistoryUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testCsvUrl(historyUrl, "history")}
                  disabled={isTestingHistory}
                  className="shrink-0"
                >
                  {isTestingHistory ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  Test
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="starting-value">Starting Portfolio Value</Label>
              <Input
                id="starting-value"
                type="number"
                placeholder="100000"
                value={startingValue}
                onChange={(e) => setStartingValue(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Setup & Tips
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isSetupOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <SetupCard />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
