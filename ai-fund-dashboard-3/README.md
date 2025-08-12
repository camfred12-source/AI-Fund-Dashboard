# AI Fund – Live Dashboard

A real-time portfolio dashboard with integrated AI news feed, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### Portfolio Dashboard
- **Real-time data**: Fetches CSV data from Google Sheets with 60-second auto-refresh
- **KPI Cards**: Portfolio value, total P&L, and weekly performance metrics
- **Interactive Charts**: Performance over time, allocation pie chart, and weight distribution
- **Holdings Table**: Detailed position data with sorting and formatting
- **Settings Management**: Configurable CSV URLs and starting portfolio value with localStorage persistence

### AI News Feed
- **Multi-source aggregation**: RSS feeds from OpenAI, NVIDIA, Google AI, Meta, TechCrunch, The Verge, and MIT Technology Review
- **Smart filtering**: Search by title/content, filter by source, and date range controls
- **Auto-refresh**: Server-side caching with 6-hour revalidation
- **Mobile-optimized**: Responsive grid layout with touch-friendly controls

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Configure your portfolio data**:
   - Set up Google Sheets with your positions and history data
   - Publish sheets as CSV (see Setup tab in dashboard for detailed instructions)
   - Enter CSV URLs in the Settings card

## API Routes

### `/api/news`
- **Method**: GET
- **Caching**: 6 hours (21,600 seconds)
- **Response**: `{ updatedAt: string, items: NewsItem[] }`
- **Sources**: Aggregates from 7 AI news sources with intelligent filtering

## Vercel Cron Setup (Optional)

To ensure fresh news data, add a Vercel Cron job to warm the cache:

1. Create `vercel.json` in your project root:
   \`\`\`json
   {
     "crons": [
       {
         "path": "/api/news",
         "schedule": "0 6 * * *"
       }
     ]
   }
   \`\`\`

2. This will ping the news API daily at 6 AM UTC to refresh the cache.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **RSS Parsing**: rss-parser
- **Icons**: Lucide React

## Project Structure

\`\`\`
├── app/
│   ├── api/news/route.ts          # RSS aggregation API
│   ├── news/page.tsx              # News page
│   └── page.tsx                   # Main dashboard
├── components/
│   ├── news/                      # News-related components
│   ├── ui/                        # shadcn/ui components
│   └── *.tsx                      # Dashboard components
├── lib/
│   ├── rss.ts                     # RSS parsing utilities
│   ├── format.ts                  # Formatting helpers
│   └── *.ts                       # Other utilities
└── README.md
\`\`\`

## Performance Features

- **ISR Caching**: API routes use Incremental Static Regeneration
- **Client-side Filtering**: Fast search and filtering without API calls
- **Memoized Computations**: Optimized React rendering
- **Responsive Images**: Favicon loading with error handling
- **Lazy Loading**: Suspense boundaries for better UX

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-fund-dashboard)

The dashboard will automatically work with Vercel's Edge Runtime and caching infrastructure.
