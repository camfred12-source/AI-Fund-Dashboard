import { Suspense } from "react"
import { NewsContent } from "@/components/news/NewsContent"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Latest AI News | AI Fund Dashboard",
  description:
    "Stay updated with the latest AI news from leading sources including OpenAI, NVIDIA, Google AI, and more.",
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Latest AI News</h1>
          <p className="text-gray-600">Auto-updates daily from leading AI sources</p>
          <p className="text-sm text-gray-500">
            Sources: OpenAI, NVIDIA, Google AI, Meta, TechCrunch, The Verge, MIT Technology Review
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">Loading latest AI news...</p>
            </div>
          }
        >
          <NewsContent />
        </Suspense>
      </div>
    </div>
  )
}
