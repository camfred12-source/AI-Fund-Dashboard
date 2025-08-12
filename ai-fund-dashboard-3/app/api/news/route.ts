import { NextResponse } from "next/server"
import { aggregateFeeds } from "@/lib/rss"

export const runtime = "nodejs"
export const revalidate = 21600 // 6 hours

export async function GET() {
  try {
    const items = await aggregateFeeds()

    const response = {
      updatedAt: new Date().toISOString(),
      items: items.slice(0, 100), // Limit to 100 most recent items
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200",
      },
    })
  } catch (error) {
    console.error("Error fetching news:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch news",
        updatedAt: new Date().toISOString(),
        items: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  }
}
