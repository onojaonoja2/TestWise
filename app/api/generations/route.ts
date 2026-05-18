import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get("documentId")

    const where: Record<string, unknown> = { userId: session.user.id }
    if (documentId) where.documentId = documentId

    const generations = await prisma.generationSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        document: {
          select: { id: true, originalName: true },
        },
        _count: {
          select: { questions: true },
        },
      },
    })

    return NextResponse.json(generations)
  } catch (error) {
    console.error("[GENERATIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
