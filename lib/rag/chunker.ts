export interface ChunkResult {
  content: string
  index: number
}

export async function chunkText(text: string): Promise<ChunkResult[]> {
  if (!text || typeof text !== "string") {
    return []
  }

  const chunkSize = 1000
  const overlap = 200
  const chunks: ChunkResult[] = []
  const MAX_CHUNKS = 10000

  let index = 0
  let start = 0
  const textLength = text.length

  if (textLength === 0) {
    return []
  }

  while (start < textLength && start >= 0) {
    if (index >= MAX_CHUNKS) {
      console.warn(`[Chunker] Reached max chunks limit (${MAX_CHUNKS}), stopping`)
      break
    }

    let end = Math.min(start + chunkSize, textLength)

    if (end < textLength && end > start) {
      const lastPeriod = text.lastIndexOf(". ", end - 1)
      const lastNewline = text.lastIndexOf("\n\n", end - 1)
      const breakpoint = Math.max(lastPeriod, lastNewline)

      if (breakpoint > start && breakpoint > start + chunkSize / 2) {
        end = breakpoint + 1
      }
    }

    end = Math.max(end, start + 1)
    end = Math.min(end, textLength)

    const content = text.slice(start, end).trim()
    if (content && content.length > 0) {
      chunks.push({ content, index })
      index++
    }

    start = end - overlap
    if (start >= textLength || start < 0 || start >= textLength) break
  }

  return chunks
}
