import { createHash, randomFillSync } from "crypto"

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    a: number = 1; b: number = 0; c: number = 0; d: number = 1;
    e: number = 0; f: number = 0;
    constructor(init?: string | number[]) {
      if (init && Array.isArray(init)) {
        if (init.length >= 6) [this.a, this.b, this.c, this.d, this.e, this.f] = init as [number, number, number, number, number, number]
      }
    }
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = {
    subtle: {} as any,
    getRandomValues: (arr: Uint8Array) => randomFillSync(arr),
  } as any
}

if (!globalThis.Hash) {
  globalThis.Hash = class Hash {
    private hash: any
    constructor(algorithm: string) {
      this.hash = createHash(algorithm)
    }
    update(data: Uint8Array) {
      this.hash.update(Buffer.from(data))
      return this
    }
    digest() {
      return new Uint8Array(this.hash.digest())
    }
    toHex() {
      return this.hash.digest("hex")
    }
  } as any
}

import { Worker } from "bullmq"
import IORedis from "ioredis"

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
})

let prisma: any
let downloadFromS3: any
let buildS3Key: any

async function initModules() {
  if (!prisma) {
    const p = await import("@/lib/prisma")
    prisma = p.prisma
    const s3 = await import("@/lib/s3")
    downloadFromS3 = s3.downloadFromS3
    buildS3Key = s3.buildS3Key
  }
  return { prisma, downloadFromS3, buildS3Key }
}

async function extractTextStreaming(buffer: Buffer, mimeType: string): Promise<string> {
  const startTime = Date.now()
  
  if (mimeType === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    buffer = null as any
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise
    
    const pageTexts: string[] = []
    const numPages = pdf.numPages

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .filter((s: string) => s && s.trim())
        .join(" ")
      if (pageText.trim()) {
        pageTexts.push(pageText)
      }
      page.cleanup()
    }
    pdf.destroy()
    const result = pageTexts.join("\n")
    console.log(`[Worker] PDF extracted ${numPages} pages in ${Date.now() - startTime}ms`)
    return result
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    buffer = null as any
    console.log(`[Worker] DOCX extracted in ${Date.now() - startTime}ms`)
    return result.value
  }

  if (mimeType === "text/plain") {
    const result = buffer.toString("utf-8")
    buffer = null as any
    console.log(`[Worker] Text extracted in ${Date.now() - startTime}ms`)
    return result
  }

  throw new Error(`Unsupported file type: ${mimeType}`)
}

const worker = new Worker(
  "document-processing",
  async (job) => {
    const { documentId, userId, filename, mimeType } = job.data
    const { prisma: p, downloadFromS3: ds3, buildS3Key: bsk } = await initModules()
    prisma = p
    downloadFromS3 = ds3
    buildS3Key = bsk

    console.log(`[Worker] Processing document: ${documentId}`)

    try {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "PROCESSING" },
      })

      const s3Key = buildS3Key(userId, filename)
      let fileBuffer = await downloadFromS3(s3Key)

      const text = await extractTextStreaming(fileBuffer, mimeType)
      fileBuffer = null as any

      await prisma.document.update({
        where: { id: documentId },
        data: { 
          content: text,
          status: "READY" 
        },
      })

      console.log(`[Worker] Document ${documentId} processed successfully (${text.length} chars)`)
      return { success: true }
    } catch (error) {
      console.error(`[Worker] Error processing document ${documentId}:`, error)

      await prisma.document.update({
        where: { id: documentId },
        data: { status: "FAILED" },
      }).catch(() => {})

      throw error
    }
  },
  { connection, concurrency: 4 }
)

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`)
})

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message)
})

console.log("[Worker] Document processing worker started")