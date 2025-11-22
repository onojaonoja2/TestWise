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

    try {
        const body = await req.json()
        const { bioData, guestInfo } = body

        // Fetch test to check if public
        const test = await prisma.test.findUnique({ where: { id: testId } })
        if (!test) return new NextResponse("Test not found", { status: 404 })

        if (!session) {
            if (!test.isPublic) {
                return new NextResponse("Unauthorized", { status: 401 })
            }
            if (!guestInfo?.name || !guestInfo?.email) {
                return new NextResponse("Guest name and email are required", { status: 400 })
            }
        }

        // Check if a submission already exists
        let existingSubmission;

        if (session) {
            existingSubmission = await prisma.submission.findFirst({
                where: {
                    testId: testId,
                    studentId: session.user.id,
                    status: 'STARTED'
                }
            })
        } else {
            // For guests, check by email in guestInfo
            // Note: This relies on guestInfo being stored consistently.
            // Since guestInfo is JSON, we might need to fetch all started submissions for this test and filter in memory, 
            // or just assume guests always start new if we don't have a better way.
            // Ideally, we should enforce unique email per test for guests too.
            // For now, let's try to find by matching the JSON path if possible, or just create new.
            // Prisma JSON filtering is supported in Postgres.
            existingSubmission = await prisma.submission.findFirst({
                where: {
                    testId: testId,
                    studentId: null,
                    status: 'STARTED',
                    guestInfo: {
                        path: ['email'],
                        equals: guestInfo.email
                    }
                }
            })
        }

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
                studentId: session ? session.user.id : null,
                guestInfo: session ? undefined : guestInfo,
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
        const submission = await prisma.submission.findFirst({
            where: {
                testId: testId,
                studentId: session.user.id,
                status: 'STARTED'
            }
        })

        if (!submission) {
            return new NextResponse(null, { status: 204 }) // No content
        }

        return NextResponse.json(submission)
    } catch (error) {
        console.error("[TEST_STATUS]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
