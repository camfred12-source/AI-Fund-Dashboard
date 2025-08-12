"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { formatRelativeTime, clampText, isRecent } from "@/lib/format"
import type { NewsItem } from "@/lib/rss"
import { useState } from "react"

interface ArticleCardProps {
  article: NewsItem
}

export function ArticleCard({ article }: ArticleCardProps) {
  const recent = isRecent(article.pubDate)
  const [faviconError, setFaviconError] = useState(false)

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).origin
      return `${domain}/favicon.ico`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(article.link)

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {faviconUrl && !faviconError && (
              <img
                src={faviconUrl || "/placeholder.svg"}
                alt=""
                className="w-4 h-4 rounded-sm"
                onError={() => setFaviconError(true)}
              />
            )}
            <Badge variant="secondary" className="text-xs font-medium">
              {article.source}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {recent && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                NEW
              </Badge>
            )}
            <span className="text-xs text-gray-500 whitespace-nowrap">{formatRelativeTime(article.pubDate)}</span>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-3 hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{clampText(article.summary, 140)}</p>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group"
        >
          Read more
          <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </CardContent>
    </Card>
  )
}
