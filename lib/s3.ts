import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { GetObjectCommand, DeleteObjectCommand, NoSuchKey } from "@aws-sdk/client-s3"
import { Readable } from "stream"

function getS3Config() {
  const region = process.env.AWS_REGION || "eu-north-1"
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set")
  }

  return { region, credentials: { accessKeyId, secretAccessKey } }
}

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client(getS3Config())
  }
  return s3Client
}

function getBucketName(): string {
  const bucket = process.env.S3_BUCKET_NAME
  if (!bucket) throw new Error("S3_BUCKET_NAME must be set")
  return bucket
}

export async function uploadToS3(
  key: string,
  body: Buffer | Readable,
  contentType: string
): Promise<string> {
  const client = getS3Client()
  const bucket = getBucketName()

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  })

  await upload.done()
  return key
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const client = getS3Client()
  const bucket = getBucketName()

  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  const response = await client.send(command)

  const chunks: Uint8Array[] = []
  const stream = response.Body as Readable
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export async function deleteFromS3(key: string): Promise<void> {
  try {
    const client = getS3Client()
    const bucket = getBucketName()
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key })
    await client.send(command)
  } catch (error) {
    if (error instanceof NoSuchKey) return
    throw error
  }
}

export function buildS3Key(userId: string, filename: string): string {
  return `uploads/${userId}/${filename}`
}
