import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY must be set")
  }

  return new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "TestWise",
    },
  })
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

    const documentContent = document.content.length > 80000 
      ? document.content.slice(0, 80000) + "\n\n[Document truncated due to length]"
      : document.content

    const systemPrompt = `You are a helpful AI assistant helping a user understand a document. Answer questions based only on the information in the document. If the document doesn't contain information to answer a question, say so clearly.

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

    const openai = getOpenRouterClient()
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o"

    const encoder = new TextEncoder()
    const conversationIdForStream = conversation.id

    const streamInstance = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ""

          const response = await openai.chat.completions.create({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 2000,
            temperature: 0.3,
            stream: true,
          })

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
          }

          await prisma.documentMessage.create({
            data: {
              conversationId: conversationIdForStream,
              role: "ASSISTANT",
              content: fullResponse,
            },
          })

          await prisma.documentConversation.update({
            where: { id: conversationIdForStream },
            data: { updatedAt: new Date() },
          })

          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(streamInstance, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Conversation-Id": conversation.id,
      },
    })
  } catch (error) {
    console.error("[CHAT_STREAM]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}