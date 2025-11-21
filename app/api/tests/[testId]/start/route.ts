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
        const { bioData } = body

        // Check if a submission already exists
        const existingSubmission = await prisma.submission.findFirst({
            where: {
                testId: testId,
                studentId: session.user.id,
                status: 'STARTED'
            }
        })

        if (existingSubmission) {
            // If already started, just return it (maybe update bioData if provided?)
            const updatedSubmission = await prisma.submission.update({
                where: { id: existingSubmission.id },
                data: {
                    bioData: bioData || existingSubmission.bioData,
                    lastHeartbeat: new Date()
                }
            })
            return NextResponse.json(updatedSubmission)
        }

        // Create new submission
        const submission = await prisma.submission.create({
            data: {
                testId,
                studentId: session.user.id,
                status: 'STARTED',
                bioData: bioData,
                startTime: new Date(),
                lastHeartbeat: new Date()
            }
        })

        return NextResponse.json(submission)
    } catch (error) {
        console.error("[TEST_START]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
