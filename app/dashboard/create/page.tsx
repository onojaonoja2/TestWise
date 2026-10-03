'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import BackButton from '@/app/components/BackButton'
import { useToast } from '@/app/components/ToastProvider'

interface QuestionDraft {
    text: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options: string[]
    points: number
    correctAnswer: string
}

interface BioDataField {
    label: string
    type: string
    required: boolean
}

export default function CreateTestPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { showToast } = useToast()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState(60)
    const [visibility, setVisibility] = useState('ORGANIZATION')
    const [targetRole, setTargetRole] = useState('STUDENT')
    const [allowedEmails, setAllowedEmails] = useState('')
    const [questions, setQuestions] = useState<QuestionDraft[]>([])
    const [bioDataFields, setBioDataFields] = useState<BioDataField[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [groups, setGroups] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        // Fetch groups for import dropdown
        fetch('/api/groups')
            .then(res => res.ok ? res.json() : [])
            .then(data => setGroups(data))
            .catch(err => console.error("Failed to fetch groups", err))
    }, [])

    // Temporary state for new question being added
    const [newQ, setNewQ] = useState<QuestionDraft>({
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        points: 1,
        correctAnswer: ''
    })

    const addQuestion = () => {
        if (!newQ.text) return showToast('Question text is required', 'warning')
        if (newQ.type === 'MULTIPLE_CHOICE' && newQ.options.some(o => !o)) return showToast('All options are required', 'warning')
        if (!newQ.correctAnswer) return showToast('Correct answer is required', 'warning')

        setQuestions([...questions, { ...newQ }])
        // Reset new question form
        setNewQ({
            text: '',
            type: 'MULTIPLE_CHOICE',
            options: ['', '', '', ''],
            points: 1,
            correctAnswer: ''
        })
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const addBioDataField = () => {
        setBioDataFields([...bioDataFields, { label: '', type: 'text', required: true }])
    }

    const removeBioDataField = (index: number) => {
        const newFields = [...bioDataFields]
        newFields.splice(index, 1)
        setBioDataFields(newFields)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateBioDataField = (index: number, field: keyof BioDataField, value: any) => {
        const newFields = [...bioDataFields]
        // @ts-expect-error: dynamic assignment
        newFields[index][field] = value
        setBioDataFields(newFields)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return showToast('Title is required', 'warning')
        if (questions.length === 0) return showToast('Add at least one question', 'warning')

        setSubmitting(true)
        try {
            const emailList = visibility === 'WHITELIST' ? allowedEmails.split(',').map(e => e.trim()).filter(e => e) : []

            const res = await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    duration,
                    visibility,
                    targetRole,
                    allowedEmails: visibility === 'WHITELIST' ? emailList : undefined,
                    questions,
                    bioDataFields
                })
            })

            if (res.ok) {
                showToast('Test created successfully!', 'success')
                router.push('/dashboard')
                router.refresh()
            } else {
                const msg = await res.text()
                showToast(msg || 'Failed to create test', 'error')
                setSubmitting(false)
            }
        } catch (error) {
            showToast('Failed to create test. Please try again.', 'error')
            setSubmitting(false)
        }
    }

    const inputClass =
        'block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all'

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-display text-2xl font-semibold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Create New Test
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">Draft your questions, set visibility, and publish when ready.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Test Details */}
                <div className="paper-card rounded-[1.75rem] p-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="title" className="block text-sm font-semibold leading-6 text-stone-900">
                                Test Title
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="duration" className="block text-sm font-semibold leading-6 text-stone-900">
                                Duration (minutes)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="duration"
                                    id="duration"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="description" className="block text-sm font-semibold leading-6 text-stone-900">
                                Description
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="visibility" className="block text-sm font-semibold leading-6 text-stone-900">
                                Test Visibility
                            </label>
                            <div className="mt-2">
                                <select
                                    id="visibility"
                                    name="visibility"
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="ORGANIZATION">Organization Only (My Org)</option>
                                    <option value="PUBLIC">Public (Anyone with link)</option>
                                    <option value="WHITELIST">Specific People (Whitelist)</option>
                                </select>
                            </div>
                            <p className="mt-1 text-sm text-stone-500">
                                {visibility === 'ORGANIZATION' && "Only users in your organization can see and take this test."}
                                {visibility === 'PUBLIC' && "Anyone with the link can take this test (Guest access allowed)."}
                                {visibility === 'WHITELIST' && "Only users with the specified emails can take this test."}
                            </p>
                        </div>

                        {/* Target Audience - Only for Sub-Admins/Admins */}
                        {(session?.user?.isSubAdmin || session?.user?.role === 'ADMIN') && (
                            <div className="col-span-full">
                                <label htmlFor="targetRole" className="block text-sm font-semibold leading-6 text-stone-900">
                                    Target Audience
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="targetRole"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="STUDENT">Students Only</option>
                                        <option value="TEACHER">Teachers Only</option>
                                        <option value="ALL">Both (Students & Teachers)</option>
                                    </select>
                                </div>
                                <p className="mt-1 text-sm text-stone-500">Who can see and take this test within the organization.</p>
                            </div>
                        )}

                        {visibility === 'WHITELIST' && (
                            <div className="col-span-full">
                                <label htmlFor="allowedEmails" className="block text-sm font-semibold leading-6 text-stone-900">
                                    Allowed Emails (comma separated)
                                </label>

                                {/* Group Import Section */}
                                <div className="mt-2 mb-2 flex items-center gap-2">
                                    <select
                                        className={`${inputClass} w-64`}
                                        onChange={async (e) => {
                                            const groupId = e.target.value
                                            if (!groupId) return

                                            try {
                                                const res = await fetch(`/api/groups/${groupId}/students`)
                                                if (res.ok) {
                                                    const students: { email: string }[] = await res.json()
                                                    const emails = students.map(s => s.email).join(', ')
                                                    setAllowedEmails(prev => prev ? `${prev}, ${emails}` : emails)
                                                }
                                            } catch (error) {
                                                console.error("Failed to import group", error)
                                                alert("Failed to import group members")
                                            }
                                            e.target.value = "" // Reset select
                                        }}
                                    >
                                        <option value="">Import from Group...</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-stone-500">Select a group to append members</span>
                                </div>

                                <div className="mt-2">
                                    <textarea
                                        id="allowedEmails"
                                        name="allowedEmails"
                                        rows={3}
                                        value={allowedEmails}
                                        onChange={(e) => setAllowedEmails(e.target.value)}
                                        placeholder="student1@example.com, student2@example.com"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio Data Configuration */}
                <div className="paper-card rounded-[1.75rem] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-lg font-semibold text-stone-900">Student Information Collection</h3>
                        <button
                            type="button"
                            onClick={addBioDataField}
                            className="text-sm text-[#9A3412] hover:text-[#C2410C] font-semibold transition-colors"
                        >
                            + Add Field
                        </button>
                    </div>
                    <p className="text-sm text-stone-500 mb-4">Define fields that students must fill out before starting the test (e.g., Student ID, Department).</p>

                    <div className="space-y-4">
                        {bioDataFields.map((field, index) => (
                            <div key={index} className="flex items-start space-x-4 bg-[#FAF7F1] border border-stone-900/8 p-4 rounded-2xl">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Field Label (e.g. Student ID)"
                                        value={field.label}
                                        onChange={(e) => updateBioDataField(index, 'label', e.target.value)}
                                        required
                                        className={inputClass}
                                    />
                                    <div className="flex space-x-4">
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateBioDataField(index, 'type', e.target.value)}
                                            className={`${inputClass} w-1/2`}
                                        >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="email">Email</option>
                                        </select>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateBioDataField(index, 'required', e.target.checked)}
                                                className="rounded border-stone-300 text-[#C2410C] focus:ring-[#C2410C]/30"
                                            />
                                            <span className="text-sm text-stone-700">Required</span>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeBioDataField(index)}
                                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        {bioDataFields.length === 0 && (
                            <p className="text-sm text-stone-400 italic">No custom fields added.</p>
                        )}
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold text-stone-900">Questions ({questions.length})</h3>
                    {questions.map((q, idx) => (
                        <div key={idx} className="paper-card rounded-2xl p-4 flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-stone-900">{idx + 1}. {q.text}</p>
                                <p className="text-sm text-stone-500">{q.type} - {q.points} pts</p>
                                <p className="text-sm text-emerald-700 font-medium">Answer: {q.correctAnswer}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeQuestion(idx)}
                                className="text-sm font-semibold text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Question Form */}
                <div className="rounded-[1.75rem] p-6 border-2 border-dashed border-stone-900/15 bg-[#FFF7ED]/60">
                    <h4 className="font-display text-base font-semibold text-stone-900 mb-4">Add Question</h4>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold leading-6 text-stone-900">Question Text</label>
                            <input
                                type="text"
                                value={newQ.text}
                                onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                                className={`${inputClass} mt-2`}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-semibold leading-6 text-stone-900">Type</label>
                            <select
                                value={newQ.type}
                                onChange={(e) => setNewQ({ ...newQ, type: e.target.value as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' })}
                                className={`${inputClass} mt-2`}
                            >
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="TRUE_FALSE">True/False</option>
                                <option value="SHORT_ANSWER">Short Answer</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-semibold leading-6 text-stone-900">Points</label>
                            <input
                                type="number"
                                value={newQ.points}
                                onChange={(e) => setNewQ({ ...newQ, points: parseInt(e.target.value) })}
                                className={`${inputClass} mt-2`}
                            />
                        </div>

                        {newQ.type === 'MULTIPLE_CHOICE' && (
                            <div className="col-span-full space-y-2">
                                <label className="block text-sm font-semibold leading-6 text-stone-900">Options</label>
                                {newQ.options.map((opt, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...newQ.options]
                                            newOptions[i] = e.target.value
                                            setNewQ({ ...newQ, options: newOptions })
                                        }}
                                        placeholder={`Option ${i + 1}`}
                                        className={inputClass}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="col-span-full">
                            <label className="block text-sm font-semibold leading-6 text-stone-900">Correct Answer</label>
                            {newQ.type === 'MULTIPLE_CHOICE' ? (
                                <select
                                    value={newQ.correctAnswer}
                                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                                    className={`${inputClass} mt-2`}
                                >
                                    <option value="">Select correct option</option>
                                    {newQ.options.map((opt, i) => (
                                        opt && <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : newQ.type === 'TRUE_FALSE' ? (
                                <select
                                    value={newQ.correctAnswer}
                                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                                    className={`${inputClass} mt-2`}
                                >
                                    <option value="">Select correct option</option>
                                    <option value="True">True</option>
                                    <option value="False">False</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={newQ.correctAnswer}
                                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                                    className={`${inputClass} mt-2`}
                                />
                            )}
                        </div>

                        <div className="col-span-full">
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm border border-stone-900/10 hover:bg-[#FAF7F1] transition-colors"
                            >
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm border border-stone-900/10 hover:bg-[#FAF7F1] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Creating...' : 'Create Test'}
                    </button>
                </div>
            </form>
        </div>
    )
}
