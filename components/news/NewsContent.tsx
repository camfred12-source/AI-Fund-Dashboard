"use client"

import { useState, useEffect, useMemo } from "react"
import { NewsControls } from "./NewsControls"
import { ArticleCard } from "./ArticleCard"
import { formatRelativeTime, filterByDays } from "@/lib/format"
import type { NewsItem } from "@/lib/rss"

interface NewsResponse {
  updatedAt: string
  items: NewsItem[]
}

export function NewsContent() {
  const [news, setNews] = useState<NewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [dayFilter, setDayFilter] = useState<number>(30)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/news", {
        next: { revalidate: 0 },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`)
      }

      const data = await response.json()
      setNews(data)

      // Extract unique sources for filter
      const sources = [...new Set(data.items.map((item: NewsItem) => item.source))]
      setSelectedSources(sources)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news")
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    if (!news?.items) return []

    return news.items
      .filter((item) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesSearch = item.title.toLowerCase().includes(query) || item.summary.toLowerCase().includes(query)
          if (!matchesSearch) return false
        }

        // Source filter
        if (selectedSources.length > 0 && !selectedSources.includes(item.source)) {
          return false
        }

        return true
      })
      .filter((item) => {
        // Day filter
        return filterByDays([item], dayFilter).length > 0
      })
  }, [news?.items, searchQuery, selectedSources, dayFilter])

  const allSources = useMemo(() => {
    return news?.items ? [...new Set(news.items.map((item) => item.source))] : []
  }, [news?.items])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Loading latest AI news...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-red-600 mb-4">
          <p className="font-medium">Failed to load news</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchNews}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No news data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Last refreshed: <span className="font-medium">{formatRelativeTime(news.updatedAt)}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Showing {filteredItems.length} of {news.items.length} articles
        </p>
      </div>

      <NewsControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSources={selectedSources}
        onSourcesChange={setSelectedSources}
        availableSources={allSources}
        dayFilter={dayFilter}
        onDayFilterChange={setDayFilter}
      />

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="text-gray-400 text-4xl">📰</div>
          <div>
            <p className="text-gray-600 font-medium">No articles found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <ArticleCard key={`${item.link}-${index}`} article={item} />
          ))}
        </div>
      )}
    </div>
  )
}
