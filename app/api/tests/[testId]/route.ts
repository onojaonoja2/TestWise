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
                        correctAnswer: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                allowedUsers: true
            }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        // Public Access Check
        if (!session) {
            if (test.visibility === 'PUBLIC' && test.published) {
                // Remove sensitive data for public access
                const sanitizedTest = {
                    ...test,
                    questions: test.questions.map(({ correctAnswer, ...q }) => q),
                    allowedUsers: undefined
                }
                return NextResponse.json(sanitizedTest)
            }
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Authenticated Access Check
        const isCreator = test.creatorId === session.user.id
        const isAdmin = session.user.role === 'ADMIN'

        if (!test.published && !isCreator && !isAdmin) {
            return new NextResponse("Test not available", { status: 403 })
        }

        if (test.archived && !isCreator && !isAdmin) {
            return new NextResponse("Test has been archived", { status: 410 })
        }

        // If not creator/admin, sanitize
        if (!isCreator && !isAdmin) {
            const sanitizedTest = {
                ...test,
                questions: test.questions.map(({ correctAnswer, ...q }) => q),
                allowedUsers: undefined
            }
            return NextResponse.json(sanitizedTest)
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
        const {
            title,
            description,
            duration,
            published,
            archived,
            visibility,
            allowedEmails,
            questions,
            bioDataFields,
            targetRole
        } = body

        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        if (test.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Check if test is editable (Draft AND No Submissions)
        // If published OR has submissions, we ONLY allow status updates (published/archived)
        const hasSubmissions = test._count.submissions > 0
        const isEditable = !test.published && !hasSubmissions

        // If trying to update content but not editable
        if (!isEditable) {
            // Check if any content field is being updated
            const isContentUpdate =
                title !== undefined ||
                description !== undefined ||
                duration !== undefined ||
                visibility !== undefined ||
                targetRole !== undefined ||
                allowedEmails !== undefined ||
                questions !== undefined ||
                bioDataFields !== undefined

            if (isContentUpdate) {
                return new NextResponse("Cannot edit content of a published test or one with submissions. Unpublish first if no submissions exist.", { status: 400 })
            }
        }

        // Transaction to update test and replace questions/allowedUsers if provided
        const updatedTest = await prisma.$transaction(async (tx) => {
            // 1. Update basic fields
            const t = await tx.test.update({
                where: { id: testId },
                data: {
                    title,
                    description,
                    duration,
                    published,
                    archived,
                    visibility,
                    targetRole: (session.user.isSubAdmin || session.user.role === 'ADMIN') ? targetRole : undefined, // Only allow update if privileged
                    bioDataFields
                }
            })

            // Only update relations if editable
            if (isEditable) {
                // 2. Update Allowed Users (Whitelist)
                if (allowedEmails && Array.isArray(allowedEmails)) {
                    await tx.testAllowedUser.deleteMany({
                        where: { testId }
                    })
                    if (allowedEmails.length > 0) {
                        await tx.testAllowedUser.createMany({
                            data: allowedEmails.map((email: string) => ({
                                testId,
                                email
                            }))
                        })
                    }
                }

                // 3. Update Questions
                if (questions && Array.isArray(questions)) {
                    // Delete existing questions
                    await tx.question.deleteMany({
                        where: { testId }
                    })

                    // Create new questions
                    for (const q of questions) {
                        await tx.question.create({
                            data: {
                                testId,
                                text: q.text,
                                type: q.type,
                                points: q.points,
                                options: q.options,
                                correctAnswer: q.correctAnswer
                            }
                        })
                    }
                }
            }

            return t
        })

        return NextResponse.json(updatedTest)
    } catch (error) {
        console.error("[TEST_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const test = await prisma.test.findUnique({
            where: { id: testId }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        if (test.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Prevent deletion if test has submissions (to preserve history)
        const submissionCount = await prisma.submission.count({ where: { testId } });
        if (submissionCount > 0) {
            return new NextResponse("Cannot delete test with existing submissions.", { status: 403 });
        }

        await prisma.test.delete({
            where: { id: testId }
        })

        return new NextResponse("Test deleted", { status: 200 })
    } catch (error) {
        console.error("[TEST_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
