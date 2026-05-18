import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { generateCompletion } from "@/lib/openrouter"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const url = new URL(req.url)
  const conversationId = url.searchParams.get("conversationId")

  if (!conversationId) {
    return new NextResponse("conversationId required", { status: 400 })
  }

  try {
    const conversation = await prisma.documentConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
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

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("[CHAT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params

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

    if (document.status !== "READY" || !document.content) {
      return new NextResponse("Document not ready for queries", { status: 400 })
    }

    const body = await req.json()
    const { message, conversationId } = body

    if (!message) {
      return new NextResponse("Message required", { status: 400 })
    }

    let conversation = conversationId
      ? await prisma.documentConversation.findUnique({ where: { id: conversationId } })
      : null

    if (conversationId && !conversation) {
      return new NextResponse("Conversation not found", { status: 404 })
    }

    if (conversation && conversation.documentId !== id) {
      return new NextResponse("Conversation does not belong to this document", { status: 400 })
    }

    if (!conversation) {
      conversation = await prisma.documentConversation.create({
        data: {
          documentId: id,
          userId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        },
      })
    }

    await prisma.documentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: message,
      },
    })

    const existingMessages = await prisma.documentMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    })

    const messageHistory = existingMessages.slice(0, -1).map(m => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
    }))

    const documentContent = document.content.length > 100000 
      ? document.content.slice(0, 100000) + "\n\n[Document truncated due to length]"
      : document.content

    const systemPrompt = `You are a helpful AI assistant helping a user understand a document. You have access to the full content of the document provided below. Answer questions based only on the information in the document. If the document doesn't contain information to answer a question, say so clearly.

Document content:
${documentContent}

Guidelines:
- Answer based on the document content
- Be clear and concise
- If you can't find the answer in the document, say "The document doesn't contain information to answer this question."
- Format your responses nicely with paragraphs when needed
- Use bullet points if listing multiple items
- Never make up information not in the document`

    const userPrompt = existingMessages.length > 0
      ? `Previous conversation:\n${messageHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\nCurrent question: ${message}`
      : message

    const response = await generateCompletion({
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
      temperature: 0.3,
    })

    const assistantMessage = await prisma.documentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: response,
      },
    })

    await prisma.documentConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      message: assistantMessage,
      conversation,
    })
  } catch (error) {
    console.error("[CHAT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}