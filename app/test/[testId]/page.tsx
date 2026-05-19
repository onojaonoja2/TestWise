'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'
import { Eye, EyeOff } from 'lucide-react'

interface Question {
    id: string
    text: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options?: string[]
    points: number
}

interface BioDataField {
    label: string
    type: string
    required: boolean
}

interface Test {
    id: string
    title: string
    description: string
    duration: number
    questions: Question[]
    bioDataFields?: BioDataField[]
}

export default function TestPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = use(params)
    const router = useRouter()
    const { data: session, status } = useSession()
    const { showToast } = useToast()
    const { confirm } = useModal()
    const [test, setTest] = useState<Test | null>(null)
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [warnings, setWarnings] = useState(0)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [submissionId, setSubmissionId] = useState<string | null>(null)

    // Bio Data & Guest State
    const [bioData, setBioData] = useState<Record<string, string>>({})
    const [registerInfo, setRegisterInfo] = useState({ name: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)
    const [bioDataSubmitted, setBioDataSubmitted] = useState(false)

    useEffect(() => {
        const initTest = async () => {
            try {
                // Fetch Test Details
                const testRes = await fetch(`/api/tests/${testId}`)

                if (testRes.status === 401) {
                    // Unauthorized and not public -> redirect to login
                    router.push(`/auth/signin?callbackUrl=/test/${testId}`)
                    return
                }

                if (!testRes.ok) throw new Error('Failed to fetch test')
                const testData = await testRes.json()
                setTest(testData)

                // Check for existing submission
                const statusRes = await fetch(`/api/tests/${testId}/start`)
                if (statusRes.status === 200) {
                    const submission = await statusRes.json()

                    if (submission.status === 'COMPLETED') {
                        alert("You have already completed this test.")
                        router.push('/dashboard')
                        return
                    }

                    setSubmissionId(submission.id)
                    setBioDataSubmitted(true)

                    // Calculate remaining time
                    const startTime = new Date(submission.startTime).getTime()
                    const durationMs = testData.duration * 60 * 1000
                    const elapsed = Date.now() - startTime
                    const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000))
                    setTimeLeft(remaining)
                }
            } catch (error) {
                console.error(error)
                alert('Error loading test')
            } finally {
                setLoading(false)
            }
        }
        initTest()
    }, [testId, router])

    // Timer Logic
    useEffect(() => {
        if (!bioDataSubmitted || timeLeft === null || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [bioDataSubmitted, timeLeft])

    // Auto-Submit on Timeout
    useEffect(() => {
        if (timeLeft === 0 && !submitting) {
            alert("Time's up! Your test is being submitted.")
            handleSubmit(true) // Pass true to skip confirmation
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, submitting])

    // Security: Fullscreen & Focus Tracking
    useEffect(() => {
        if (loading || !test || !bioDataSubmitted) return

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
        }, 30000) // Send heartbeat every 30 seconds

        document.addEventListener('visibilitychange', handleVisibilityChange)
        document.addEventListener('contextmenu', preventCopyPaste)
        document.addEventListener('copy', preventCopyPaste)
        document.addEventListener('paste', preventCopyPaste)
        document.addEventListener('click', enforceFullscreen)

        // Initial fullscreen attempt
        enterFullscreen()

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
    }, [loading, test, testId, warnings, bioDataSubmitted])

    const handleBioDataSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate Registration Info
        if (!session && (!registerInfo.name || !registerInfo.email || !registerInfo.password)) {
            alert("Name, Email, and Password are required")
            return
        }

        if (test?.bioDataFields) {
            for (const field of test.bioDataFields) {
                if (field.required && !bioData[field.label]) {
                    alert(`${field.label} is required`)
                    return
                }
            }
        }

        try {
            // Handle Registration if not logged in
            if (!session) {
                setIsRegistering(true)
                const regRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerInfo)
                })

                if (!regRes.ok) {
                    const msg = await regRes.text()
                    throw new Error(msg || "Registration failed")
                }

                // Auto-login
                const loginRes = await signIn('credentials', {
                    redirect: false,
                    email: registerInfo.email,
                    password: registerInfo.password
                })

                if (loginRes?.error) {
                    throw new Error("Login failed after registration")
                }

                // Reload page to refresh session and start test
                window.location.reload()
                return
            }

            // Start the test session on the server
            const res = await fetch(`/api/tests/${testId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bioData }) // No guestInfo needed anymore
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg || "Failed to start test")
            }

            const submission = await res.json()
            setSubmissionId(submission.id)

            // Initialize timer
            if (test) {
                const startTime = new Date(submission.startTime).getTime()
                const durationMs = test.duration * 60 * 1000
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000))
                setTimeLeft(remaining)
            }

            setBioDataSubmitted(true)
        } catch (error) {
            console.error("Failed to start test", error)
            alert(error instanceof Error ? error.message : "Failed to start test")
            setIsRegistering(false)
        }
    }

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit) {
            const confirmed = await confirm({
                title: 'Submit Test',
                message: 'Are you sure you want to submit? You cannot change your answers after submission.',
                confirmText: 'Submit',
                cancelText: 'Cancel',
                type: 'warning',
            })
            if (!confirmed) return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/tests/${testId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, warnings, submissionId })
            })

            if (!res.ok) throw new Error('Submission failed')

            // If guest, maybe show a "Thank you" page instead of redirecting to dashboard?
            if (!session) {
                alert("Test submitted successfully! Thank you.")
                router.push('/')
            } else {
                router.push('/dashboard')
            }
        } catch (error) {
            console.error(error)
            alert('Failed to submit test')
            setSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading || status === 'loading') return <div className="p-8 text-center">Loading test...</div>
    if (!test) return <div className="p-8 text-center">Test not found</div>

    // Bio Data Form
    if (!bioDataSubmitted) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {test.title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {test.bioDataFields && test.bioDataFields.length > 0
                            ? "Please provide your information to start the test."
                            : "Click below to start the test."}
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleBioDataSubmit}>
                            {/* Registration Fields */}
                            {!session && (
                                <>
                                    <div className="bg-indigo-50 p-4 rounded-md mb-6">
                                        <h3 className="text-sm font-medium text-indigo-800 mb-2">Quick Registration</h3>
                                        <p className="text-xs text-indigo-600 mb-4">Create an account to start the test. You&apos;ll be able to access your results later.</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="regName" className="block text-sm font-medium text-gray-700">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        id="regName"
                                                        type="text"
                                                        required
                                                        value={registerInfo.name}
                                                        onChange={(e) => setRegisterInfo({ ...registerInfo, name: e.target.value })}
                                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        id="regEmail"
                                                        type="email"
                                                        required
                                                        value={registerInfo.email}
                                                        onChange={(e) => setRegisterInfo({ ...registerInfo, email: e.target.value })}
                                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700">
                                                    Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        id="regPassword"
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        value={registerInfo.password}
                                                        onChange={(e) => setRegisterInfo({ ...registerInfo, password: e.target.value })}
                                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-xs text-center">
                                            <a href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                                                Already have an account? Sign in
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}

                            {test.bioDataFields?.map((field, index) => (
                                <div key={index}>
                                    <label htmlFor={`field-${index}`} className="block text-sm font-medium text-gray-700">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id={`field-${index}`}
                                            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                                            required={field.required}
                                            value={bioData[field.label] || ''}
                                            onChange={(e) => setBioData({ ...bioData, [field.label]: e.target.value })}
                                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            ))}

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isRegistering ? 'Creating Account...' : (session ? 'Start Test' : 'Register & Start Test')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 select-none">
            {/* Sticky Header with Timer */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 truncate max-w-xs">{test.title}</h2>
                <div className={`text-xl font-mono font-bold ${timeLeft !== null && timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                    Time Left: {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-16">
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
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        onClick={() => handleSubmit(false)}
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
