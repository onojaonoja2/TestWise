import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
        return new NextResponse("Forbidden", { status: 403 })
    }

    try {
        const body = await req.json()
        const { title, description, duration, questions, bioDataFields, visibility, allowedEmails, targetRole } = body

        if (!title || !questions || questions.length === 0) {
            return new NextResponse("Title and at least one question are required", { status: 400 })
        }

        const test = await prisma.test.create({
            data: {
                title,
                description,
                duration: parseInt(duration),
                creatorId: session.user.id,
                visibility: visibility || 'ORGANIZATION',
                targetRole: (session.user.isSubAdmin || session.user.role === 'ADMIN') ? (targetRole || 'STUDENT') : 'STUDENT',
                bioDataFields: bioDataFields, // Save bio-data configuration
                questions: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    create: questions.map((q: any) => ({
                        text: q.text,
                        type: q.type,
                        points: parseInt(q.points),
                        options: q.options,
                        correctAnswer: q.correctAnswer
                    }))
                },
                allowedUsers: (visibility === 'WHITELIST' && allowedEmails && allowedEmails.length > 0) ? {
                    create: allowedEmails.map((email: string) => ({
                        email: email.trim()
                    }))
                } : undefined
            }
        })

        return NextResponse.json(test)
    } catch (error) {
        console.error("[TEST_CREATE]", error)
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 })
    }
}
