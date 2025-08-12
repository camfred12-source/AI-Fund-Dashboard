export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>© 2024 AI Fund – Live</span>
          <span>•</span>
          <span>v1.0.0</span>
        </div>
        <div className="text-sm text-muted-foreground">Built with Next.js & v0</div>
      </div>
    </footer>
  )
}
