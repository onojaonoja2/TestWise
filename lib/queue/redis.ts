import { Queue } from "bullmq"
import { createRedisConnection } from "./connection"

const connection = createRedisConnection()

export const documentQueue = new Queue("document-processing", { connection })

export interface DocumentJobData {
  documentId: string
  userId: string
  filename: string
  mimeType: string
}

export async function addDocumentJob(data: DocumentJobData) {
  return documentQueue.add("process-document", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  })
}

export async function closeConnection() {
  await connection.quit()
}