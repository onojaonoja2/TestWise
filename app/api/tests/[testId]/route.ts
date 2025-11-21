import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const test = await prisma.test.findUnique({
            where: {
                id: testId,
            },
            include: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        type: true,
                        options: true,
                        points: true,
                        // Exclude correctAnswer for security
                    }
                }
            }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        // Check if test is published or if user is creator/admin
        if (!test.published && test.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse("Test not available", { status: 403 })
        }

        return NextResponse.json(test)
    } catch (error) {
        console.error("[TEST_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { published, archived } = body

        const test = await prisma.test.findUnique({
            where: { id: testId }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        if (test.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const updatedTest = await prisma.test.update({
            where: { id: testId },
            data: {
                published: published !== undefined ? published : test.published,
                archived: archived !== undefined ? archived : test.archived
            }
        })

        return NextResponse.json(updatedTest)
    } catch (error) {
        console.error("[TEST_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
