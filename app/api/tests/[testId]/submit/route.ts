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
        const { answers } = body // { questionId: answerValue }

        // Start a transaction to ensure data integrity
        const submission = await prisma.$transaction(async (tx: any) => {
            // Create the submission record
            const newSubmission = await tx.submission.create({
                data: {
                    testId: testId,
                    studentId: session.user.id,
                    endTime: new Date(),
                    graded: false, // Auto-grading logic to be added later
                }
            })

            // Create answer records
            if (answers && typeof answers === 'object') {
                const answerPromises = Object.entries(answers).map(([questionId, value]) => {
                    return tx.answer.create({
                        data: {
                            submissionId: newSubmission.id,
                            questionId,
                            value: String(value),
                        }
                    })
                })
                await Promise.all(answerPromises)
            }

            return newSubmission
        })

        return NextResponse.json(submission)
    } catch (error) {
        console.error("[TEST_SUBMIT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
