'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
    id: string
    text: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options?: string[]
    points: number
}

interface Test {
    id: string
    title: string
    description: string
    duration: number
    questions: Question[]
}

export default function TestPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = use(params)
    const router = useRouter()
    const [test, setTest] = useState<Test | null>(null)
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [warnings, setWarnings] = useState(0)

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/tests/${testId}`)
                if (!res.ok) throw new Error('Failed to fetch test')
                const data = await res.json()
                setTest(data)
            } catch (error) {
                console.error(error)
                alert('Error loading test')
            } finally {
                setLoading(false)
            }
        }
        fetchTest()
    }, [testId])

    // Security: Fullscreen & Focus Tracking
    useEffect(() => {
        if (loading || !test) return

        const enterFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen()
                }
            } catch (e) {
                console.error('Fullscreen denied', e)
            }
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => {
                    const newCount = prev + 1
                    alert(`WARNING: You left the test window! This has been recorded. Warning ${newCount}/3`)
                    return newCount
                })
            }
        }

        const preventCopyPaste = (e: Event) => {
            e.preventDefault()
            return false
        }

        // Enforce fullscreen on click (browsers require user interaction)
        const enforceFullscreen = () => {
            if (!document.fullscreenElement) {
                enterFullscreen()
            }
        }

        // Heartbeat interval
        const heartbeatInterval = setInterval(() => {
            fetch(`/api/tests/${testId}/heartbeat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ warnings })
            }).catch(console.error)
        }, 5000) // Send heartbeat every 5 seconds

        document.addEventListener('visibilitychange', handleVisibilityChange)
        document.addEventListener('contextmenu', preventCopyPaste)
        document.addEventListener('copy', preventCopyPaste)
        document.addEventListener('paste', preventCopyPaste)
        document.addEventListener('click', enforceFullscreen)

        return () => {
            clearInterval(heartbeatInterval)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            document.removeEventListener('contextmenu', preventCopyPaste)
            document.removeEventListener('copy', preventCopyPaste)
            document.removeEventListener('paste', preventCopyPaste)
            document.removeEventListener('click', enforceFullscreen)
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { })
            }
        }
    }, [loading, test, testId, warnings])

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    const handleSubmit = async () => {
        if (!confirm('Are you sure you want to submit?')) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/tests/${testId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, warnings })
            })

            if (!res.ok) throw new Error('Submission failed')

            router.push('/dashboard') // Redirect to dashboard after submission
        } catch (error) {
            console.error(error)
            alert('Failed to submit test')
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading test...</div>
    if (!test) return <div className="p-8 text-center">Test not found</div>

    return (
        <div className="min-h-screen bg-gray-50 py-8 select-none">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {warnings > 0 && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Security Warnings: {warnings}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8 rounded-lg bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                    <p className="mt-2 text-gray-600">{test.description}</p>
                    <div className="mt-4 text-sm text-gray-500">
                        Duration: {test.duration} minutes
                    </div>
                </div>

                <div className="space-y-6">
                    {test.questions.map((q, index) => (
                        <div key={q.id} className="rounded-lg bg-white p-6 shadow">
                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {index + 1}. {q.text}
                                </h3>
                                <span className="text-sm text-gray-500">{q.points} pts</span>
                            </div>

                            <div className="mt-4">
                                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                    <div className="space-y-2">
                                        {q.options.map((option) => (
                                            <label key={option} className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={option}
                                                    checked={answers[q.id] === option}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'TRUE_FALSE' && (
                                    <div className="space-y-2">
                                        {['True', 'False'].map((option) => (
                                            <label key={option} className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={option}
                                                    checked={answers[q.id] === option}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'SHORT_ANSWER' && (
                                    <textarea
                                        rows={3}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        placeholder="Type your answer here..."
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>
        </div>
    )
}
