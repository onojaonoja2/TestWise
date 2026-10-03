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
        return <div className="p-8 text-center text-stone-500">Submission not found</div>
    }

    // Security check: only allow student who took the test or admin/teacher to view
    if (submission.studentId !== session.user.id && session.user.role === 'STUDENT') {
        return <div className="p-8 text-center text-stone-500">Unauthorized</div>
    }

    const totalPoints = submission.test.questions.reduce((acc: number, q: { points: number }) => acc + q.points, 0)
    const scorePercentage = submission.score ? Math.round((submission.score / totalPoints) * 100) : 0

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <Link href="/dashboard" className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="paper-card rounded-[1.75rem] p-6 sm:p-8">
                <div className="border-b border-stone-900/10 pb-6">
                    <h1 className="font-display text-2xl font-semibold text-stone-900">{submission.test.title} - Results</h1>
                    <p className="mt-2 text-sm text-stone-500">
                        Completed on {new Date(submission.endTime || '').toLocaleString()}
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#FFF7ED] border border-[#C2410C]/15 p-5 text-center">
                        <dt className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[#9A3412]">Your Score</dt>
                        <dd className="font-display mt-1 text-3xl font-semibold tracking-tight text-stone-900">
                            {submission.score} / {totalPoints}
                        </dd>
                    </div>
                    <div className="rounded-2xl bg-stone-900 p-5 text-center">
                        <dt className="truncate text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Percentage</dt>
                        <dd className="font-display mt-1 text-3xl font-semibold tracking-tight text-[#FFF7ED]">
                            {scorePercentage}%
                        </dd>
                    </div>
                </div>

                {submission.currentWarnings > 0 && (
                    <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-semibold text-red-800">
                                    Security Warnings Recorded: {submission.currentWarnings}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="font-display text-lg font-semibold text-stone-900">Question Breakdown</h2>
                    <div className="mt-4 space-y-4">
                        {submission.test.questions.map((q, index) => {
                            const answer = submission.answers.find((a) => a.questionId === q.id)
                            const isCorrect = answer?.isCorrect

                            return (
                                <div key={q.id} className={`rounded-2xl border p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
                                    <div className="flex justify-between gap-4">
                                        <span className="font-semibold text-stone-900">{index + 1}. {q.text}</span>
                                        <span className={`shrink-0 text-sm font-semibold ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                                            {isCorrect ? `+${q.points} pts` : '0 pts'}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-stone-600">
                                        <p>Your Answer: <span className="font-semibold text-stone-900">{answer?.value || 'No answer'}</span></p>
                                        {!isCorrect && (
                                            <p className="mt-1 font-medium text-emerald-800">Correct Answer: {q.correctAnswer}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
