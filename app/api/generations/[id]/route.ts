import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
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
        document: {
          select: { id: true, originalName: true },
        },
        questions: {
          orderBy: { id: "asc" },
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

    return NextResponse.json(generation)
  } catch (error) {
    console.error("[GENERATION_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
