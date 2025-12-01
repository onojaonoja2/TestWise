import { getServerSession } from "next-auth"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ResultPage({ params }: { params: Promise<{ submissionId: string }> }) {
    const session = await getServerSession(authOptions)
    const { submissionId } = await params

    if (!session) {
        redirect("/auth/signin")
    }

    const submission = await prisma.submission.findUnique({
        where: {
            id: submissionId
        },
        include: {
            test: {
                include: {
                    questions: true
                }
            },
            answers: true
        }
    })

    if (!submission) {
        return <div>Submission not found</div>
    }

    // Security check: only allow student who took the test or admin/teacher to view
    if (submission.studentId !== session.user.id && session.user.role === 'STUDENT') {
        return <div>Unauthorized</div>
    }

    const totalPoints = submission.test.questions.reduce((acc: number, q: { points: number }) => acc + q.points, 0)
    const scorePercentage = submission.score ? Math.round((submission.score / totalPoints) * 100) : 0

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="border-b border-gray-200 pb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{submission.test.title} - Results</h1>
                        <p className="mt-2 text-gray-600">
                            Completed on {new Date(submission.endTime || '').toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="rounded-lg bg-indigo-50 p-4 text-center">
                            <dt className="truncate text-sm font-medium text-indigo-500">Your Score</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-900">
                                {submission.score} / {totalPoints}
                            </dd>
                        </div>
                        <div className="rounded-lg bg-indigo-50 p-4 text-center">
                            <dt className="truncate text-sm font-medium text-indigo-500">Percentage</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-900">
                                {scorePercentage}%
                            </dd>
                        </div>
                    </div>

                    {submission.currentWarnings > 0 && (
                        <div className="mt-6 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Security Warnings Recorded: {submission.currentWarnings}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900">Question Breakdown</h2>
                        <div className="mt-4 space-y-6">
                            {submission.test.questions.map((q, index) => {
                                const answer = submission.answers.find((a) => a.questionId === q.id)
                                const isCorrect = answer?.isCorrect

                                return (
                                    <div key={q.id} className={`rounded-lg border p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-900">{index + 1}. {q.text}</span>
                                            <span className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                                {isCorrect ? `+${q.points} pts` : '0 pts'}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p>Your Answer: <span className="font-medium">{answer?.value || 'No answer'}</span></p>
                                            {!isCorrect && (
                                                <p className="mt-1 text-green-700">Correct Answer: {q.correctAnswer}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
