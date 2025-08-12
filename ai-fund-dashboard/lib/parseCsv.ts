export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsv(csvText: string): ParsedCsv {
  // Remove BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, "")

  // Split into lines, handling CRLF
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Parse CSV line with proper quote handling
  function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    // Add final field
    result.push(current.trim())
    return result
  }

  const headers = parseCsvLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
      rows.push(row)
    }
  }

  return { headers, rows }
}

// Case-insensitive header finder
export function findHeader(headers: string[], possibleNames: string[]): string | null {
  const lowerHeaders = headers.map((h) => h.toLowerCase())
  const lowerPossible = possibleNames.map((n) => n.toLowerCase())

  for (const possible of lowerPossible) {
    const index = lowerHeaders.indexOf(possible)
    if (index !== -1) {
      return headers[index]
    }
  }
  return null
}
