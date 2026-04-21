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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Dashboard</h1>
                {isTeacher && (
                    <div className="flex bg-white p-1 rounded-md shadow-sm border border-gray-200">
                        <Link
                            href="/dashboard"
                            className={`px-4 py-2 text-sm font-medium rounded-md ${!showArchived ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            Active
                        </Link>
                        <Link
                            href="/dashboard?view=archived"
                            className={`px-4 py-2 text-sm font-medium rounded-md ${showArchived ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
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
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 flex items-center p-5">
                            <div className="rounded-md bg-indigo-50 p-3">
                                <FileText className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-gray-500">My Tests</dt>
                                <dd className="text-2xl font-semibold text-gray-900">{userTests.length}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 flex items-center p-5">
                            <div className="rounded-md bg-green-50 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Submissions</dt>
                                <dd className="text-2xl font-semibold text-gray-900">{totalSubmissionsToTests}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 flex items-center p-5">
                            <div className="rounded-md bg-blue-50 p-3">
                                <LayoutDashboard className="h-6 w-6 text-blue-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-gray-500">Published Tests</dt>
                                <dd className="text-2xl font-semibold text-gray-900">{userTests.filter(t => t.published).length}</dd>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 flex items-center p-5">
                            <div className="rounded-md bg-blue-50 p-3">
                                <FileText className="h-6 w-6 text-blue-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-gray-500">Available Tests</dt>
                                <dd className="text-2xl font-semibold text-gray-900">{availableTests.length}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 flex items-center p-5">
                            <div className="rounded-md bg-green-50 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="truncate text-sm font-medium text-gray-500">Tests Completed</dt>
                                <dd className="text-2xl font-semibold text-gray-900">{completedSubmissions.length}</dd>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Teacher Section: My Created Tests */}
            {isTeacher && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            {showArchived ? "My Archived Tests" : "My Created Tests"}
                        </h2>
                        <Link
                            href="/dashboard/create"
                            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            Create Test
                        </Link>
                    </div>

                    {userTests.length === 0 ? (
                        <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No tests</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new test.</p>
                            <div className="mt-6">
                                <Link
                                    href="/dashboard/create"
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
                                >
                                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    New Test
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {userTests.map((test) => (
                                <div key={test.id} className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-lg font-semibold leading-tight text-gray-900 truncate">
                                                {test.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                {test.description || "No description provided"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                                            {test.published ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Published</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">Draft</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex items-center text-sm text-gray-600 mb-4 gap-4 bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{test._count.submissions}</span> 
                                                <span className="text-xs">subs</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{test.duration}</span> 
                                                <span className="text-xs">mins</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-gray-100">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Link
                                                    href={`/dashboard/test/${test.id}/monitor`}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
                                                >
                                                    Monitor
                                                </Link>
                                                <Link
                                                    href={`/dashboard/test/${test.id}/results`}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
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
                <h2 className="text-lg font-medium text-gray-900 mb-4">Available Tests</h2>
                {availableTests.length === 0 ? (
                    <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-8 bg-gray-50">
                        <p className="text-sm text-gray-500">No tests available right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {availableTests.map((test) => (
                            <Link key={test.id} href={`/test/${test.id}`} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold leading-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {test.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                        {test.description}
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 pt-3">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-indigo-400" />
                                        <span>{test.duration} mins</span>
                                    </div>
                                    <span className="font-medium text-indigo-600 flex items-center group-hover:translate-x-1 transition-transform">
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Results</h2>
                    <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-xl">
                        <ul role="list" className="divide-y divide-gray-100">
                            {completedSubmissions.map((submission) => (
                                <li key={submission.id} className="relative flex justify-between gap-x-6 py-5 px-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex min-w-0 gap-x-4">
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-gray-900">
                                                <Link href={`/dashboard/results/${submission.id}`}>
                                                    <span className="absolute inset-x-0 -top-px bottom-0" />
                                                    {submission.test.title}
                                                </Link>
                                            </p>
                                            <p className="mt-1 flex text-xs leading-5 text-gray-500">
                                                Submitted on {new Date(submission.endTime || '').toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-x-4">
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm leading-6 text-gray-900">Score</p>
                                            <p className="mt-1 text-lg font-bold leading-5 text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
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
