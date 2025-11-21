import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Find all started submissions for this test
        const activeSubmissions = await prisma.submission.findMany({
            where: {
                testId,
                status: 'STARTED'
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                lastHeartbeat: 'desc'
            }
        })

        return NextResponse.json(activeSubmissions)
    } catch (error) {
        console.error("[MONITOR_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
