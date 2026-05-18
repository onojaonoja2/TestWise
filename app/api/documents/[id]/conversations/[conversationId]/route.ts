import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; conversationId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id, conversationId } = await params

  try {
    const conversation = await prisma.documentConversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 })
    }

    if (conversation.documentId !== id) {
      return new NextResponse("Conversation does not belong to this document", { status: 400 })
    }

    if (conversation.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.documentConversation.delete({
      where: { id: conversationId },
    })

    return new NextResponse("Conversation deleted", { status: 200 })
  } catch (error) {
    console.error("[CONVERSATION_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}