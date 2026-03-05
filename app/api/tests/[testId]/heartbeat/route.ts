import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { warnings } = body

        // Attempt to update an active submission
        const updateResult = await prisma.submission.updateMany({
            where: {
                testId,
                studentId: session.user.id,
                status: 'STARTED'
            },
            data: {
                lastHeartbeat: new Date(),
                currentWarnings: warnings
            }
        })

        if (updateResult.count === 0) {
            // Check if already completed to avoid re-opening
            const completedSubmission = await prisma.submission.findFirst({
                where: {
                    testId,
                    studentId: session.user.id,
                    status: 'COMPLETED'
                }
            })

            if (!completedSubmission) {
                // Create new submission if not exists and not completed
                await prisma.submission.create({
                    data: {
                        testId,
                        studentId: session.user.id,
                        status: 'STARTED',
                        lastHeartbeat: new Date(),
                        currentWarnings: warnings
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[HEARTBEAT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
