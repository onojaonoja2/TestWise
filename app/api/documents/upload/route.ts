import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadToS3, buildS3Key } from "@/lib/s3"
import { validateMimeType, validateFileSize, validateMagicBytes } from "@/lib/validators/document"
import { addDocumentJob } from "@/lib/queue/redis"

function generateUUID(): string {
  return crypto.randomUUID()
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    const mimeType = file.type
    const sizeResult = validateFileSize(file.size)
    if (!sizeResult.valid) {
      return new NextResponse(sizeResult.error, { status: 400 })
    }

    const mimeResult = validateMimeType(mimeType)
    if (!mimeResult.valid) {
      return new NextResponse(mimeResult.error, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const magicResult = validateMagicBytes(buffer, mimeType)
    if (!magicResult.valid) {
      return new NextResponse(magicResult.error, { status: 400 })
    }

    const uuid = generateUUID()
    const filename = `${uuid}-${file.name}`
    const s3Key = buildS3Key(session.user.id, filename)

    const document = await prisma.document.create({
      data: {
        filename,
        originalName: file.name,
        mimeType,
        size: buffer.length,
        status: "PROCESSING",
        userId: session.user.id,
      },
    })

    try {
      await uploadToS3(s3Key, buffer, mimeType)
    } catch (s3Error) {
      await prisma.document.delete({ where: { id: document.id } }).catch(() => {})
      console.error("[DOCUMENT_UPLOAD] S3 upload failed:", s3Error)
      return new NextResponse("Failed to upload file to storage", { status: 500 })
    }

    try {
      await addDocumentJob({
        documentId: document.id,
        userId: session.user.id,
        filename,
        mimeType,
      })
    } catch (queueError) {
      console.error("[DOCUMENT_UPLOAD] Failed to queue job:", queueError)
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      }).catch(() => {})
      return new NextResponse("Document uploaded but processing failed to start. Please try again.", { status: 500 })
    }

    return NextResponse.json({ id: document.id }, { status: 201 })
  } catch (error) {
    console.error("[DOCUMENT_UPLOAD]", error)
    const message = error instanceof Error ? error.message : "Internal Error"
    return new NextResponse(message, { status: 500 })
  }
}