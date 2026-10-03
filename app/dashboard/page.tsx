import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import TestManagementButtons from "./components/TestManagementButtons"
import { CheckCircle, Clock, FileText, LayoutDashboard, Plus, Users } from "lucide-react"

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const session = await getServerSession(authOptions)
    const { view } = await searchParams

    if (!session) {
        redirect("/auth/signin")
    }

    if (session.user.role === 'ADMIN') {
        redirect("/dashboard/admin")
    }

    const showArchived = view === 'archived'

    const userTests = await prisma.test.findMany({
        where: {
            creatorId: session.user.id,
            archived: showArchived
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { submissions: true }
            }
        }
    })

    const allSubmissions = await prisma.submission.findMany({
        where: {
            studentId: session.user.id
        },
        include: {
            test: true
        },
        orderBy: {
            endTime: 'desc'
        }
    })

    const completedSubmissions = allSubmissions.filter(s => s.status === 'COMPLETED')
    const completedTestIds = completedSubmissions.map(s => s.testId)
    const startedTestIds = allSubmissions.map(s => s.testId)

    const targetRoleFilter = session.user.role === 'STUDENT'
        ? ['STUDENT', 'ALL']
        : ['TEACHER', 'ALL']

    const availableTests = await prisma.test.findMany({
        where: {
            published: true,
            archived: false,
            id: {
                notIn: completedTestIds
            },
            NOT: {
                creatorId: session.user.id
            },
            OR: [
                {
                    visibility: 'WHITELIST',
                    allowedUsers: {
                        some: {
                            email: session.user.email || undefined
                        }
                    }
                },
                session.user.role === 'STUDENT' ? {
                    id: { in: startedTestIds },
                    visibility: 'ORGANIZATION',
                    creator: { organizationId: session.user.organizationId }
                } : ({
                    visibility: 'ORGANIZATION',
                    creator: { organizationId: session.user.organizationId },
                    targetRole: { in: targetRoleFilter }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }) as any
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const isTeacher = session.user.role === 'TEACHER' || session.user.role === 'ADMIN'
    const totalSubmissionsToTests = isTeacher ? userTests.reduce((acc, test) => acc + test._count.submissions, 0) : 0

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C2410C]">Overview</p>
                    <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">Dashboard</h1>
                </div>
                {isTeacher && (
                    <div className="flex bg-white p-1 rounded-full shadow-sm border border-stone-900/10">
                        <Link
                            href="/dashboard"
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${!showArchived ? 'bg-stone-900 text-[#FFF7ED]' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-900/5'}`}
                        >
                            Active
                        </Link>
                        <Link
                            href="/dashboard?view=archived"
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${showArchived ? 'bg-stone-900 text-[#FFF7ED]' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-900/5'}`}
                        >
                            Archived
                        </Link>
                    </div>
                )}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isTeacher ? (
                    <>
                        <div className="paper-card overflow-hidden rounded-3xl flex items-center p-5">
                            <div className="rounded-2xl bg-[#C2410C]/10 p-3">
                                <FileText className="h-6 w-6 text-[#C2410C]" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-stone-500">My Tests</dt>
                                <dd className="font-display text-2xl font-semibold text-stone-900">{userTests.length}</dd>
                            </div>
                        </div>
                        <div className="paper-card overflow-hidden rounded-3xl flex items-center p-5">
                            <div className="rounded-2xl bg-emerald-700/10 p-3">
                                <CheckCircle className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-stone-500">Total Submissions</dt>
                                <dd className="font-display text-2xl font-semibold text-stone-900">{totalSubmissionsToTests}</dd>
                            </div>
                        </div>
                        <div className="paper-card overflow-hidden rounded-3xl flex items-center p-5">
                            <div className="rounded-2xl bg-stone-900 p-3">
                                <LayoutDashboard className="h-6 w-6 text-[#FFF7ED]" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-stone-500">Published Tests</dt>
                                <dd className="font-display text-2xl font-semibold text-stone-900">{userTests.filter(t => t.published).length}</dd>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="paper-card overflow-hidden rounded-3xl flex items-center p-5">
                            <div className="rounded-2xl bg-[#C2410C]/10 p-3">
                                <FileText className="h-6 w-6 text-[#C2410C]" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-stone-500">Available Tests</dt>
                                <dd className="font-display text-2xl font-semibold text-stone-900">{availableTests.length}</dd>
                            </div>
                        </div>
                        <div className="paper-card overflow-hidden rounded-3xl flex items-center p-5">
                            <div className="rounded-2xl bg-emerald-700/10 p-3">
                                <CheckCircle className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-stone-500">Tests Completed</dt>
                                <dd className="font-display text-2xl font-semibold text-stone-900">{completedSubmissions.length}</dd>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Teacher Section: My Created Tests */}
            {isTeacher && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-xl font-semibold text-stone-900">
                            {showArchived ? "My Archived Tests" : "My Created Tests"}
                        </h2>
                        <Link
                            href="/dashboard/create"
                            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] transition-all duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            Create Test
                        </Link>
                    </div>

                    {userTests.length === 0 ? (
                        <div className="paper-card text-center rounded-[1.75rem] border-dashed p-12">
                            <FileText className="mx-auto h-12 w-12 text-stone-300" />
                            <h3 className="mt-2 font-display text-lg font-semibold text-stone-900">No tests</h3>
                            <p className="mt-1 text-sm text-stone-500">Get started by creating a new test.</p>
                            <div className="mt-6">
                                <Link
                                    href="/dashboard/create"
                                    className="inline-flex items-center rounded-full bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(194,65,12,0.7)] hover:bg-[#9A3412] transition-all duration-200"
                                >
                                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    New Test
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {userTests.map((test) => (
                                <div key={test.id} className="paper-card paper-card-hover relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="font-display text-lg font-semibold leading-tight text-stone-900 truncate">
                                                {test.title}
                                            </h3>
                                            <p className="text-sm text-stone-500 line-clamp-2 mt-1">
                                                {test.description || "No description provided"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                                            {test.published ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-700/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-700/20">Published</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/20">Draft</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex items-center text-sm text-stone-600 mb-4 gap-4 bg-[#FAF7F1] border border-stone-900/8 rounded-2xl p-3">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-4 w-4 text-[#C2410C]" />
                                                <span className="font-semibold text-stone-900">{test._count.submissions}</span>
                                                <span className="text-xs">subs</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-[#C2410C]" />
                                                <span className="font-semibold text-stone-900">{test.duration}</span>
                                                <span className="text-xs">mins</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-stone-900/10">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Link
                                                    href={`/dashboard/test/${test.id}/monitor`}
                                                    className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors whitespace-nowrap"
                                                >
                                                    Monitor
                                                </Link>
                                                <Link
                                                    href={`/dashboard/test/${test.id}/results`}
                                                    className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors whitespace-nowrap"
                                                >
                                                    Results
                                                </Link>
                                            </div>
                                            <TestManagementButtons
                                                testId={test.id}
                                                published={test.published}
                                                archived={test.archived}
                                                visibility={test.visibility}
                                                submissionCount={test._count.submissions}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Student Section: Available Tests */}
            <div>
                <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">Available Tests</h2>
                {availableTests.length === 0 ? (
                    <div className="paper-card text-center rounded-[1.5rem] border-dashed p-8">
                        <p className="text-sm text-stone-500">No tests available right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {availableTests.map((test) => (
                            <Link key={test.id} href={`/test/${test.id}`} className="paper-card paper-card-hover group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-5">
                                <div className="mb-4">
                                    <h3 className="font-display text-base font-semibold leading-tight text-stone-900 group-hover:text-[#C2410C] transition-colors">
                                        {test.title}
                                    </h3>
                                    <p className="text-sm text-stone-500 line-clamp-2 mt-1">
                                        {test.description}
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center justify-between text-sm text-stone-500 border-t border-stone-900/10 pt-3">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-[#C2410C]" />
                                        <span>{test.duration} mins</span>
                                    </div>
                                    <span className="font-semibold text-[#9A3412] flex items-center group-hover:translate-x-1 transition-transform">
                                        Take Test →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Student Section: Completed Tests */}
            {completedSubmissions.length > 0 && (
                <div>
                    <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">Recent Results</h2>
                    <div className="paper-card overflow-hidden sm:rounded-[1.5rem]">
                        <ul role="list" className="divide-y divide-stone-900/8">
                            {completedSubmissions.map((submission) => (
                                <li key={submission.id} className="relative flex justify-between gap-x-6 py-5 px-4 sm:px-6 hover:bg-[#FAF7F1] transition-colors">
                                    <div className="flex min-w-0 gap-x-4">
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-stone-900">
                                                <Link href={`/dashboard/results/${submission.id}`}>
                                                    <span className="absolute inset-x-0 -top-px bottom-0" />
                                                    {submission.test.title}
                                                </Link>
                                            </p>
                                            <p className="mt-1 flex text-xs leading-5 text-stone-500">
                                                Submitted on {new Date(submission.endTime || '').toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-x-4">
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm leading-6 text-stone-500">Score</p>
                                            <p className="mt-1 rounded-lg bg-stone-900 px-2.5 py-1 text-lg font-bold leading-5 text-[#FFF7ED]">
                                                {submission.score}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
