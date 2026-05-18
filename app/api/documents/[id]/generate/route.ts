import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { generateQuestionsFromDocument } from "@/lib/rag/generator"
import { processExistingDocument } from "@/lib/document-processor"

const generateRateLimit = new Map<string, { count: number; resetTime: number }>()
const GENERATE_RATE_LIMIT = 10
const GENERATE_WINDOW_MS = 60 * 60 * 1000

function checkGenerateRateLimit(userId: string): boolean {
  const now = Date.now()
  const record = generateRateLimit.get(userId)

  if (!record || now > record.resetTime) {
    generateRateLimit.set(userId, {
      count: 1,
      resetTime: now + GENERATE_WINDOW_MS,
    })
    return true
  }

  if (record.count >= GENERATE_RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params

  if (!checkGenerateRateLimit(session.user.id)) {
    return new NextResponse(
      "Rate limit exceeded. Maximum 10 generations per hour.",
      { status: 429 }
    )
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    if (document.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (document.status === "FAILED") {
      return new NextResponse(
        "Document processing failed. Please re-upload.",
        { status: 400 }
      )
    }

    if (document.status === "PROCESSING") {
      return new NextResponse(
        "Document is still processing. Please wait.",
        { status: 400 }
      )
    }

    if (document.status !== "READY") {
      return new NextResponse(
        "Document is not ready. Please wait for processing to complete.",
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      questionType = "MULTIPLE_CHOICE",
      count = 5,
      difficulty = "medium",
      prompt,
    } = body

    const genSession = await prisma.generationSession.create({
      data: {
        documentId: id,
        userId: document.userId,
        questionType,
        count,
        difficulty,
        prompt,
        status: "PROCESSING",
      },
    })

    try {
      const generated = await generateQuestionsFromDocument({
        documentId: id,
        questionType,
        count,
        difficulty,
        customPrompt: prompt,
      })

      await prisma.generatedQuestion.createMany({
        data: generated.map((q) => ({
          sessionId: genSession.id,
          text: q.text,
          type: q.type as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
          points: 1,
          options: q.options ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sourceChunks: JSON.stringify(q.sourceChunks),
        })),
      })

      await prisma.generationSession.update({
        where: { id: genSession.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      })

      return NextResponse.json({ id: genSession.id })
    } catch (error) {
      await prisma.generationSession.update({
        where: { id: genSession.id },
        data: { status: "FAILED" },
      })
      throw error
    }
  } catch (error) {
    console.error("[DOCUMENT_GENERATE]", error)
    const message = error instanceof Error ? error.message : "Internal Error"
    return new NextResponse(message, { status: 500 })
  }
}
