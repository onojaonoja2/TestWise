import { prisma } from "@/lib/prisma"
import { uploadToS3, buildS3Key, deleteFromS3 } from "@/lib/s3"
import { chunkText } from "./rag/chunker"
import { embedChunks } from "./rag/embedder"
import { validateMimeType, validateFileSize, validateMagicBytes } from "./validators/document"

function generateUUID(): string {
  return crypto.randomUUID()
}

async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { default: PDFParser } = await import("pdf2json")
    return new Promise<string>((resolve, reject) => {
      const parser = new PDFParser(null, true, "") as any
      parser.on("pdfParser_dataReady", () => {
        const raw = parser.getRawTextContent()
        parser.destroy()
        resolve(raw)
      })
      parser.on("pdfParser_dataError", (err: unknown) => {
        parser.destroy()
        reject(err instanceof Error ? err : new Error("PDF parsing failed"))
      })
      parser.parseBuffer(Buffer.from(buffer))
    })
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8")
  }

  throw new Error(`Unsupported file type: ${mimeType}`)
}

async function processChunksInSmallBatches(
  documentId: string,
  chunks: { content: string; index: number }[]
): Promise<void> {
  const BATCH_SIZE = 20

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const embeddings = await embedChunks(batch)

    for (const chunk of embeddings) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (id, "documentId", content, "index", embedding)
         VALUES ($1, $2, $3, $4, $5::vector)`,
        crypto.randomUUID(),
        documentId,
        chunk.content,
        chunk.index,
        `[${chunk.embedding.join(",")}]`
      )
    }

    try { global.gc?.() } catch {}
  }
}

export async function processDocument(
  userId: string,
  originalName: string,
  mimeType: string,
  fileBuffer: Buffer
) {
  const mimeResult = validateMimeType(mimeType)
  if (!mimeResult.valid) throw new Error(mimeResult.error)

  const sizeResult = validateFileSize(fileBuffer.length)
  if (!sizeResult.valid) throw new Error(sizeResult.error)

  const magicResult = validateMagicBytes(fileBuffer, mimeType)
  if (!magicResult.valid) throw new Error(magicResult.error)

  const uuid = generateUUID()
  const filename = `${uuid}-${originalName}`
  const s3Key = buildS3Key(userId, filename)

  const document = await prisma.document.create({
    data: {
      filename,
      originalName,
      mimeType,
      size: fileBuffer.length,
      status: "PROCESSING",
      userId,
    },
  })

  try {
    await uploadToS3(s3Key, fileBuffer, mimeType)

    const text = await extractText(fileBuffer, mimeType)
    fileBuffer = Buffer.alloc(0)

    const chunks = await chunkText(text)

    await processChunksInSmallBatches(document.id, chunks)

    await prisma.document.update({
      where: { id: document.id },
      data: { status: "READY" },
    })

    return document.id
  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "FAILED" },
    }).catch(() => {})

    await deleteFromS3(s3Key).catch(() => {})

    throw error
  }
}

export async function processExistingDocument(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!document) throw new Error("Document not found")
  if (document.status === "PROCESSING")
    throw new Error("Document is already processing")

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  })

  try {
    const s3Key = buildS3Key(document.userId, document.filename)

    const { downloadFromS3 } = await import("./s3")
    const fileBuffer = await downloadFromS3(s3Key)

    await prisma.documentChunk.deleteMany({
      where: { documentId },
    })

    const text = await extractText(fileBuffer, document.mimeType)

    const chunks = await chunkText(text)

    await processChunksInSmallBatches(document.id, chunks)

    await prisma.document.update({
      where: { id: document.id },
      data: { status: "READY" },
    })
  } catch (error) {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "FAILED" },
    }).catch(() => {})
    throw error
  }
}