"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface NewsControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
  availableSources: string[]
  dayFilter: number
  onDayFilterChange: (days: number) => void
}

const DAY_FILTER_OPTIONS = [
  { value: 7, label: "Past 7 days" },
  { value: 14, label: "Past 2 weeks" },
  { value: 30, label: "Past month" },
  { value: 90, label: "Past 3 months" },
]

export function NewsControls({
  searchQuery,
  onSearchChange,
  selectedSources,
  onSourcesChange,
  availableSources,
  dayFilter,
  onDayFilterChange,
}: NewsControlsProps) {
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false)

  const handleSourceToggle = (source: string) => {
    if (selectedSources.includes(source)) {
      onSourcesChange(selectedSources.filter((s) => s !== source))
    } else {
      onSourcesChange([...selectedSources, source])
    }
  }

  const handleSelectAllSources = () => {
    onSourcesChange(availableSources)
  }

  const handleClearAllSources = () => {
    onSourcesChange([])
  }

  const clearSearch = () => {
    onSearchChange("")
  }

  const hasActiveFilters = searchQuery || selectedSources.length !== availableSources.length || dayFilter !== 30

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles by title or content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Day Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <div className="flex gap-1">
                {DAY_FILTER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={dayFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDayFilterChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sources:</span>
              <DropdownMenu open={isSourceMenuOpen} onOpenChange={setIsSourceMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Filter className="h-3 w-3" />
                    {selectedSources.length === availableSources.length
                      ? "All Sources"
                      : `${selectedSources.length} Selected`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="flex gap-2 p-2">
                    <Button variant="ghost" size="sm" onClick={handleSelectAllSources} className="text-xs flex-1">
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClearAllSources} className="text-xs flex-1">
                      Clear All
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  {availableSources.map((source) => (
                    <DropdownMenuCheckboxItem
                      key={source}
                      checked={selectedSources.includes(source)}
                      onCheckedChange={() => handleSourceToggle(source)}
                    >
                      {source}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange("")
                  onSourcesChange(availableSources)
                  onDayFilterChange(30)
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedSources.length !== availableSources.length) && (
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button onClick={clearSearch} className="ml-1 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSources.length !== availableSources.length && (
                <Badge variant="secondary" className="gap-1">
                  {selectedSources.length === 0
                    ? "No sources selected"
                    : `${selectedSources.length}/${availableSources.length} sources`}
                  <button onClick={() => onSourcesChange(availableSources)} className="ml-1 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
