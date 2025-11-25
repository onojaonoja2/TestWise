import { getServerSession } from "next-auth"
import { authOptions } from "../../../../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import BackButton from "@/app/components/BackButton"

export default async function TestResultsPage({ params }: { params: Promise<{ testId: string }> }) {
    const session = await getServerSession(authOptions)
    const { testId } = await params

    if (!session) {
        redirect("/auth/signin")
    }

    // Access Control
    let hasAccess = false

    if (session.user.role === 'ADMIN') {
        hasAccess = true
    } else if (session.user.role === 'TEACHER') {
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
        return <div>Unauthorized</div>
    }

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
        return <div>Test not found</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mt-2 text-2xl font-bold text-gray-900">{test.title} - Class Results</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">
                                Total Submissions: {test.submissions.length}
                            </div>
                            <a
                                href={`/api/tests/${testId}/export`}
                                className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                            >
                                Export to Excel
                            </a>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Student
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Bio Data
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Score
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Warnings
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Submitted At
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {test.submissions.map((submission: any) => (
                                <tr key={submission.id}>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                                                    <span className="font-medium leading-none text-white">
                                                        {submission.student.name?.[0] || submission.student.email[0].toUpperCase()}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{submission.student.name}</div>
                                                <div className="text-sm text-gray-500">{submission.student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {submission.bioData ? (
                                            <div className="flex flex-col">
                                                {Object.entries(submission.bioData as Record<string, any>).map(([key, value]) => (
                                                    <span key={key} className="text-xs">
                                                        <span className="font-semibold">{key}:</span> {value}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900 font-semibold">{submission.score}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {submission.currentWarnings > 0 ? (
                                            <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                                                {submission.currentWarnings}
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                0
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(submission.endTime || '').toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <Link href={`/dashboard/results/${submission.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
