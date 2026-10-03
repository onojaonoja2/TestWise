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
        return <div className="p-8 text-center text-stone-500">Unauthorized</div>
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
        return <div className="p-8 text-center text-stone-500">Test not found</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display mt-2 text-2xl font-semibold text-stone-900">{test.title} - Class Results</h1>
                        <p className="mt-1 text-sm text-stone-500">Per-student scores, warnings, and submission detail.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-stone-500">
                            Total Submissions: <span className="font-semibold text-stone-900">{test.submissions.length}</span>
                        </div>
                        <a
                            href={`/api/tests/${testId}/export`}
                            className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] transition-colors"
                        >
                            Export to Excel
                        </a>
                    </div>
                </div>
            </div>

            <div className="paper-card overflow-x-auto rounded-[1.5rem]">
                <table className="min-w-full divide-y divide-stone-900/8">
                    <thead className="bg-[#FAF7F1]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                                Student
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                                Bio Data
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                                Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                                Warnings
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                                Submitted At
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900/8 bg-white">
                        {test.submissions.map((submission) => (
                            <tr key={submission.id} className="hover:bg-[#FAF7F1] transition-colors">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-900">
                                                <span className="font-semibold leading-none text-[#FFF7ED]">
                                                    {submission.student?.name?.[0] || submission.student?.email?.[0]?.toUpperCase() || '?'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-stone-900">{submission.student?.name || 'Unknown Student'}</div>
                                            <div className="text-sm text-stone-500">{submission.student?.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                    {submission.bioData ? (
                                        <div className="flex flex-col">
                                            {Object.entries(submission.bioData as Record<string, string | number>).map(([key, value]) => (
                                                <span key={key} className="text-xs">
                                                    <span className="font-semibold text-stone-700">{key}:</span> {value}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-stone-400 italic">N/A</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-stone-900 font-semibold">{submission.score}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {submission.currentWarnings > 0 ? (
                                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold leading-5 text-red-800">
                                            {submission.currentWarnings}
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold leading-5 text-emerald-800">
                                            0
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                    {new Date(submission.endTime || '').toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold">
                                    <Link href={`/dashboard/results/${submission.id}`} className="text-[#9A3412] hover:text-[#C2410C] transition-colors">
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
