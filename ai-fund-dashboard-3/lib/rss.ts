export interface NewsItem {
  title: string
  link: string
  source: string
  pubDate: string // ISO string
  summary: string
}

export interface RSSFeed {
  url: string
  source: string
  filter?: (item: any) => boolean
}

export const RSS_FEEDS: RSSFeed[] = [
  {
    url: "https://openai.com/news/rss.xml",
    source: "OpenAI",
  },
  {
    url: "https://blogs.nvidia.com/feed/",
    source: "NVIDIA",
  },
  {
    url: "https://blog.google/technology/ai/rss/",
    source: "Google AI",
  },
  {
    url: "https://engineering.fb.com/feed/",
    source: "Meta",
    filter: (item) => {
      const title = item.title?.toLowerCase() || ""
      const content = item.summary?.toLowerCase() || ""
      return (
        title.includes("ai") ||
        title.includes("ml") ||
        title.includes("machine learning") ||
        content.includes("ai") ||
        content.includes("machine learning")
      )
    },
  },
  {
    url: "https://techcrunch.com/tag/artificial-intelligence/feed/",
    source: "TechCrunch",
  },
  {
    url: "https://www.theverge.com/rss/index.xml",
    source: "The Verge",
    filter: (item) => {
      const title = item.title?.toLowerCase() || ""
      return title.includes("ai") || title.includes("artificial intelligence")
    },
  },
  {
    url: "https://www.technologyreview.com/feed/",
    source: "MIT Technology Review",
    filter: (item) => {
      const title = item.title?.toLowerCase() || ""
      const content = item.summary?.toLowerCase() || ""
      return (
        title.includes("ai") ||
        title.includes("artificial intelligence") ||
        content.includes("ai") ||
        content.includes("artificial intelligence")
      )
    },
  },
]

function parseRSSFeed(xmlText: string): any[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, "text/xml")

  // Handle both RSS and Atom feeds
  const items = Array.from(doc.querySelectorAll("item, entry"))

  return items.map((item) => {
    const title = item.querySelector("title")?.textContent || ""
    const link = item.querySelector("link")?.textContent || item.querySelector("link")?.getAttribute("href") || ""
    const pubDate = item.querySelector("pubDate, published, updated")?.textContent || ""
    const description = item.querySelector("description, summary, content")?.textContent || ""

    return {
      title: title.trim(),
      link: link.trim(),
      pubDate,
      contentSnippet: description
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300),
      content: description,
    }
  })
}

export async function fetchSingleFeed(feedConfig: RSSFeed): Promise<NewsItem[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(feedConfig.url, {
      headers: {
        "User-Agent": "AI Fund Dashboard/1.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      signal: controller.signal,
      redirect: "follow", // Follow redirects automatically
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xmlText = await response.text()
    let items = parseRSSFeed(xmlText)

    // Apply filter if provided
    if (feedConfig.filter) {
      items = items.filter(feedConfig.filter)
    }

    return items.map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "",
      source: feedConfig.source,
      pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary: item.contentSnippet || item.content || "",
    }))
  } catch (error) {
    console.error(`Failed to fetch feed from ${feedConfig.source}:`, error)
    return []
  }
}

export async function aggregateFeeds(): Promise<NewsItem[]> {
  const feedPromises = RSS_FEEDS.map((feedConfig) => fetchSingleFeed(feedConfig).catch(() => []))

  const feedResults = await Promise.all(feedPromises)
  const allItems = feedResults.flat()

  // Remove duplicates by link
  const uniqueItems = allItems.filter((item, index, self) => index === self.findIndex((t) => t.link === item.link))

  // Sort by publication date (newest first)
  return uniqueItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}
