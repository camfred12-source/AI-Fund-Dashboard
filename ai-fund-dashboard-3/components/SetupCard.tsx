"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Link, Settings } from "lucide-react"

export function SetupCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Google Sheets Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              Positions Tab
            </div>
            <div className="text-sm space-y-2">
              <p>Create a tab with these headers:</p>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                Ticker, Name, Shares, Price, MarketValue, Weight
              </div>
              <ul className="space-y-1 text-gray-600">
                <li>
                  • Use <code className="bg-gray-100 px-1 rounded">=GOOGLEFINANCE(A2, "price")</code> for{" "}
                  <strong>Price</strong>
                </li>
                <li>
                  • Set <code className="bg-gray-100 px-1 rounded">MarketValue = Shares * Price</code>
                </li>
                <li>
                  • Set <code className="bg-gray-100 px-1 rounded">Weight = MarketValue / SUM(MarketValue)</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              History Tab
            </div>
            <div className="text-sm space-y-2">
              <p>Create a tab with these headers:</p>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs">Date, PortfolioValue</div>
              <ul className="space-y-1 text-gray-600">
                <li>• Add a new row daily with current date</li>
                <li>• Use Apps Script for automation, or paste snapshots manually</li>
                <li>• PortfolioValue should be the total portfolio value for that date</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 font-medium mb-3">
            <Link className="h-4 w-4 text-purple-600" />
            Publishing Steps
          </div>
          <div className="text-sm space-y-2">
            <p>For each tab, follow these steps to get the CSV URL:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-4">
              <li>
                Go to <strong>File → Share → Publish to web</strong>
              </li>
              <li>In the dropdown, select the specific tab (Positions or History)</li>
              <li>
                Choose <strong>CSV</strong> as the format
              </li>
              <li>
                Click <strong>Publish</strong> and copy the generated link
              </li>
              <li>Paste the link in the settings above</li>
            </ol>
            <div className="bg-blue-50 p-3 rounded-md mt-3">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> The dashboard refreshes data every 60 seconds automatically. Make sure your
                Google Sheet is set to "Anyone with the link can view" for the CSV URLs to work.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
