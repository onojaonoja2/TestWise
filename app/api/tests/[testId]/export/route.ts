import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import ExcelJS from 'exceljs'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Access Control
    let hasAccess = false

    if (session.user.role === 'ADMIN') {
        hasAccess = true
    } else if (session.user.role === 'TEACHER') {
        // Teachers can access if they created it OR if they are sub-admin of the creator's org
        const testCheck = await prisma.test.findUnique({
            where: { id: testId },
            select: { creatorId: true, creator: { select: { organizationId: true } } }
        })

        if (testCheck) {
            if (testCheck.creatorId === session.user.id) {
                hasAccess = true
            } else if (session.user.isSubAdmin && testCheck.creator.organizationId === session.user.organizationId) {
                hasAccess = true
            }
        }
    }

    if (!hasAccess) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    try {
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                submissions: {
                    where: {
                        status: 'COMPLETED'
                    },
                    include: {
                        student: true
                    },
                    orderBy: {
                        score: 'desc'
                    }
                }
            }
        })

        if (!test) {
            return new NextResponse("Test not found", { status: 404 })
        }

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Results')

        // Define columns
        worksheet.columns = [
            { header: 'Student Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Score', key: 'score', width: 10 },
            { header: 'Warnings', key: 'warnings', width: 10 },
            { header: 'Submitted At', key: 'submittedAt', width: 20 },
            { header: 'Bio Data', key: 'bioData', width: 50 },
        ]

        // Add rows
        test.submissions.forEach(submission => {
            const bioDataString = submission.bioData
                ? Object.entries(submission.bioData as Record<string, any>)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')
                : 'N/A'

            worksheet.addRow({
                name: submission.student?.name || (submission.guestInfo as any)?.name || 'Unknown',
                email: submission.student?.email || (submission.guestInfo as any)?.email || 'Unknown',
                score: submission.score,
                warnings: submission.currentWarnings,
                submittedAt: submission.endTime ? new Date(submission.endTime).toLocaleString() : 'N/A',
                bioData: bioDataString
            })
        })

        // Style header row
        worksheet.getRow(1).font = { bold: true }

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Return response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${test.title.replace(/[^a-z0-9]/gi, '_')}_Results.xlsx"`
            }
        })

    } catch (error) {
        console.error("Export error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
