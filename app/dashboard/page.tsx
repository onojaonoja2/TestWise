import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/signin")
    }

    const userTests = await prisma.test.findMany({
        where: {
            creatorId: session.user.id
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

    const availableTests = await prisma.test.findMany({
        where: {
            published: true,
            NOT: {
                creatorId: session.user.id // Don't show own tests in "Available" list
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const completedSubmissions = await prisma.submission.findMany({
        where: {
            studentId: session.user.id,
            status: 'COMPLETED'
        },
        include: {
            test: true
        },
        orderBy: {
            endTime: 'desc'
        }
    })

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-xl font-bold text-indigo-600">SecureTest</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">Welcome, {session.user.name || session.user.email}</span>
                            <Link
                                href="/api/auth/signout"
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Sign out
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Action Bar */}
                    <div className="mb-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
                        {(session.user.role === 'TEACHER' || session.user.role === 'ADMIN') && (
                            <Link
                                href="/dashboard/create"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Create New Test
                            </Link>
                        )}
                    </div>

                    {/* Teacher Section: My Created Tests */}
                    {(session.user.role === 'TEACHER' || session.user.role === 'ADMIN') && (
                        <div className="mb-12">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Created Tests</h2>
                            <div className="overflow-hidden bg-white shadow sm:rounded-md">
                                <ul role="list" className="divide-y divide-gray-200">
                                    {userTests.length === 0 ? (
                                        <li className="px-4 py-4 sm:px-6 text-gray-500">You haven't created any tests yet.</li>
                                    ) : (
                                        userTests.map((test: any) => (
                                            <li key={test.id}>
                                                <div className="block hover:bg-gray-50">
                                                    <div className="px-4 py-4 sm:px-6">
                                                        <div className="flex items-center justify-between">
                                                            <p className="truncate text-sm font-medium text-indigo-600">{test.title}</p>
                                                            <div className="ml-2 flex flex-shrink-0">
                                                                <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${test.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                    {test.published ? 'Published' : 'Draft'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 sm:flex sm:justify-between">
                                                            <div className="sm:flex">
                                                                <p className="flex items-center text-sm text-gray-500">
                                                                    {test.description}
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                                <p className="mr-4">
                                                                    {test._count.submissions} submissions
                                                                </p>
                                                                <div className="flex space-x-2">
                                                                    <Link
                                                                        href={`/dashboard/test/${test.id}/monitor`}
                                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                                    >
                                                                        Monitor
                                                                    </Link>
                                                                    <span className="text-gray-300">|</span>
                                                                    <Link
                                                                        href={`/dashboard/test/${test.id}/results`}
                                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                                    >
                                                                        Results
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Student Section: Available Tests */}
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Tests</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {availableTests.length === 0 ? (
                                <p className="text-gray-500 col-span-full">No tests available at the moment.</p>
                            ) : (
                                availableTests.map((test: any) => (
                                    <div key={test.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/test/${test.id}`} className="focus:outline-none">
                                                <span className="absolute inset-0" aria-hidden="true" />
                                                <p className="text-sm font-medium text-gray-900">{test.title}</p>
                                                <p className="truncate text-sm text-gray-500">{test.description}</p>
                                                <p className="mt-1 text-xs text-gray-400">{test.duration} mins</p>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Student Section: Completed Tests */}
                    {completedSubmissions.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Results</h2>
                            <div className="overflow-hidden bg-white shadow sm:rounded-md">
                                <ul role="list" className="divide-y divide-gray-200">
                                    {completedSubmissions.map((submission: any) => (
                                        <li key={submission.id}>
                                            <Link href={`/dashboard/results/${submission.id}`} className="block hover:bg-gray-50">
                                                <div className="px-4 py-4 sm:px-6">
                                                    <div className="flex items-center justify-between">
                                                        <p className="truncate text-sm font-medium text-indigo-600">{submission.test.title}</p>
                                                        <div className="ml-2 flex flex-shrink-0">
                                                            <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                                Score: {submission.score}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:flex sm:justify-between">
                                                        <div className="sm:flex">
                                                            <p className="flex items-center text-sm text-gray-500">
                                                                Submitted on {new Date(submission.endTime || '').toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}
