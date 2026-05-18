import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params

  try {
    const generation = await prisma.generationSession.findUnique({
      where: { id },
      include: {
        questions: {
          where: { approved: true },
        },
      },
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

    if (generation.questions.length === 0) {
      return new NextResponse(
        "No approved questions in this generation session",
        { status: 400 }
      )
    }

    const body = await req.json()
    const { testId, title, description, duration } = body

    if (testId) {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: { _count: { select: { submissions: true } } },
      })

      if (!test) {
        return new NextResponse("Test not found", { status: 404 })
      }

      if (test.creatorId !== session.user.id && session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }

      if (test.published || test._count.submissions > 0) {
        return new NextResponse(
          "Cannot modify a published test or one with submissions",
          { status: 400 }
        )
      }

      await prisma.question.createMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: generation.questions.map((q: any) => ({
          testId,
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      })

      return NextResponse.json({ testId })
    } else {
      if (!title) {
        return new NextResponse(
          "Title is required when creating a new test",
          { status: 400 }
        )
      }

      const newTest = await prisma.test.create({
        data: {
          title,
          description: description || `Test generated from document`,
          duration: parseInt(duration) || 30,
          creatorId: session.user.id,
          visibility: "ORGANIZATION",
          targetRole: "STUDENT",
          questions: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: generation.questions.map((q: any) => ({
              text: q.text,
              type: q.type,
              points: q.points,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          },
        },
      })

      return NextResponse.json({ testId: newTest.id })
    }
  } catch (error) {
    console.error("[GENERATION_APPLY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
