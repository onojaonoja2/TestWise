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

    // Session check moved inside logic to allow guest submissions with submissionId

    try {
        const body = await req.json()
        const { answers, warnings, submissionId } = body // { questionId: answerValue }

        // Fetch test with questions and correct answers for grading
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: { questions: true }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        // Start a transaction to ensure data integrity
        const submission = await prisma.$transaction(async (tx: any) => {
            let totalScore = 0
            const gradedAnswers = []

            // Calculate score
            if (answers && typeof answers === 'object') {
                for (const [questionId, value] of Object.entries(answers)) {
                    const question = test.questions.find((q: any) => q.id === questionId)
                    if (question) {
                        let isCorrect = false
                        // Simple string comparison for now. 
                        if (String(value).trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                            isCorrect = true
                            totalScore += question.points
                        }
                        gradedAnswers.push({
                            questionId,
                            value: String(value),
                            isCorrect
                        })
                    }
                }
            }

            // Find existing STARTED submission
            let existingSubmission;

            if (submissionId) {
                existingSubmission = await tx.submission.findUnique({
                    where: { id: submissionId }
                })

                // Verify submission belongs to this test
                if (existingSubmission && existingSubmission.testId !== testId) {
                    throw new Error("Invalid submission ID for this test")
                }

                // If session exists, verify ownership
                if (session && existingSubmission && existingSubmission.studentId !== session.user.id) {
                    throw new Error("Submission does not belong to user")
                }
            } else if (session) {
                existingSubmission = await tx.submission.findFirst({
                    where: {
                        testId: testId,
                        studentId: session.user.id,
                        status: 'STARTED'
                    }
                })
            } else {
                throw new Error("Unauthorized: No session or submission ID")
            }

            if (!existingSubmission) {
                throw new Error("Submission not found or already completed")
            }

            if (existingSubmission.status !== 'STARTED') {
                // Already completed, just return it
                return existingSubmission
            }

            // Update existing submission
            const newSubmission = await tx.submission.update({
                where: { id: existingSubmission.id },
                data: {
                    status: 'COMPLETED',
                    endTime: new Date(),
                    score: totalScore,
                    graded: true,
                    currentWarnings: warnings || 0,
                    lastHeartbeat: new Date()
                }
            })

            // Create answer records
            for (const ans of gradedAnswers) {
                await tx.answer.create({
                    data: {
                        submissionId: newSubmission.id,
                        questionId: ans.questionId,
                        value: ans.value,
                        isCorrect: ans.isCorrect
                    }
                })
            }

            return newSubmission
        })

        return NextResponse.json(submission)
    } catch (error) {
        console.error("[TEST_SUBMIT]", error)
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 })
    }
}
