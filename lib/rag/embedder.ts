import { generateEmbeddings } from "@/lib/openrouter"

export async function embedChunks(
  chunks: { content: string; index: number }[]
): Promise<{ content: string; index: number; embedding: number[] }[]> {
  const texts = chunks.map((c) => c.content)
  const embeddings = await generateEmbeddings(texts)

  return chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }))
}
