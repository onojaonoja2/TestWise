import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; qId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id, qId } = await params

  try {
    const generation = await prisma.generationSession.findUnique({
      where: { id },
    })

    if (!generation) {
      return new NextResponse("Generation not found", { status: 404 })
    }

    if (
      generation.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const question = await prisma.generatedQuestion.findUnique({
      where: { id: qId },
    })

    if (!question || question.sessionId !== id) {
      return new NextResponse("Question not found", { status: 404 })
    }

    const body = await req.json()
    const { text, type, options, correctAnswer, explanation, points, approved, feedback } = body

    const updated = await prisma.generatedQuestion.update({
      where: { id: qId },
      data: {
        ...(text !== undefined && { text }),
        ...(type !== undefined && { type }),
        ...(options !== undefined && { options }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(points !== undefined && { points }),
        ...(approved !== undefined && { approved }),
        ...(feedback !== undefined && { feedback }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[GENERATION_QUESTION_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
