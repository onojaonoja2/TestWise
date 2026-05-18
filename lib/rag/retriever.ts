import { generateEmbedding } from "@/lib/openrouter"
import { prisma } from "@/lib/prisma"

export interface RetrievedChunk {
  content: string
  index: number
  similarity: number
}

export async function retrieveRelevantChunks(
  documentId: string,
  query: string,
  topK: number = 10
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(query)

  const result = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `SELECT content, "index", 1 - (embedding <=> $1::vector) AS similarity
     FROM "DocumentChunk"
     WHERE "documentId" = $2
     AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    `[${queryEmbedding.join(",")}]`,
    documentId,
    topK
  )

  return result.map((r) => ({
    content: r.content,
    index: r.index,
    similarity: r.similarity,
  }))
}
