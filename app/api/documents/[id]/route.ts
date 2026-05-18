import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { deleteFromS3, buildS3Key } from "@/lib/s3"

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
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        _count: {
          select: { conversations: true, generations: true },
        },
        generations: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    if (document.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("[DOCUMENT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params

  try {
    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return new NextResponse("Document already deleted", { status: 200 })
    }

    if (document.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const s3Key = buildS3Key(document.userId, document.filename)
    await deleteFromS3(s3Key).catch(() => {})

    await prisma.document.delete({
      where: { id },
    }).catch((err) => {
      if (err.code === 'P2025') return
      throw err
    })

    return new NextResponse("Document deleted", { status: 200 })
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error)
    const message = error instanceof Error ? error.message : "Internal Error"
    return new NextResponse(message, { status: 500 })
  }
}
