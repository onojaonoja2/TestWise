'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import BackButton from '@/app/components/BackButton'

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
        if (!newQ.text) return alert('Question text is required')
        if (newQ.type === 'MULTIPLE_CHOICE' && newQ.options.some(o => !o)) return alert('All options are required')
        if (!newQ.correctAnswer) return alert('Correct answer is required')

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

    const updateBioDataField = (index: number, field: keyof BioDataField, value: any) => {
        const newFields = [...bioDataFields]
        // @ts-ignore
        newFields[index][field] = value
        setBioDataFields(newFields)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return alert('Title is required')
        if (questions.length === 0) return alert('Add at least one question')

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
                router.push('/dashboard')
                router.refresh()
            } else {
                const msg = await res.text()
                console.error(`Failed to create test: ${msg}`)
                alert(`Failed to create test. Check console for details.`)
                setSubmitting(false)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to create test. Check console for details.')
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Create New Test
                            </h2>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Test Details */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                                    Test Title
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900">
                                    Duration (minutes)
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        name="duration"
                                        id="duration"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                                    Description
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="visibility" className="block text-sm font-medium leading-6 text-gray-900">
                                    Test Visibility
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="visibility"
                                        name="visibility"
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="ORGANIZATION">Organization Only (My Org)</option>
                                        <option value="PUBLIC">Public (Anyone with link)</option>
                                        <option value="WHITELIST">Specific People (Whitelist)</option>
                                    </select>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {visibility === 'ORGANIZATION' && "Only users in your organization can see and take this test."}
                                    {visibility === 'PUBLIC' && "Anyone with the link can take this test (Guest access allowed)."}
                                    {visibility === 'WHITELIST' && "Only users with the specified emails can take this test."}
                                </p>
                            </div>

                            {/* Target Audience - Only for Sub-Admins/Admins */}
                            {(session?.user?.isSubAdmin || session?.user?.role === 'ADMIN') && (
                                <div className="col-span-full">
                                    <label htmlFor="targetRole" className="block text-sm font-medium leading-6 text-gray-900">
                                        Target Audience
                                    </label>
                                    <div className="mt-2">
                                        <select
                                            id="targetRole"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        >
                                            <option value="STUDENT">Students Only</option>
                                            <option value="TEACHER">Teachers Only</option>
                                            <option value="ALL">Both (Students & Teachers)</option>
                                        </select>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Who can see and take this test within the organization.</p>
                                </div>
                            )}

                            {visibility === 'WHITELIST' && (
                                <div className="col-span-full">
                                    <label htmlFor="allowedEmails" className="block text-sm font-medium leading-6 text-gray-900">
                                        Allowed Emails (comma separated)
                                    </label>

                                    {/* Group Import Section */}
                                    <div className="mt-2 mb-2 flex items-center gap-2">
                                        <select
                                            className="block w-64 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        <span className="text-xs text-gray-500">Select a group to append members</span>
                                    </div>

                                    <div className="mt-2">
                                        <textarea
                                            id="allowedEmails"
                                            name="allowedEmails"
                                            rows={3}
                                            value={allowedEmails}
                                            onChange={(e) => setAllowedEmails(e.target.value)}
                                            placeholder="student1@example.com, student2@example.com"
                                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio Data Configuration */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Student Information Collection</h3>
                            <button
                                type="button"
                                onClick={addBioDataField}
                                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                                + Add Field
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Define fields that students must fill out before starting the test (e.g., Student ID, Department).</p>

                        <div className="space-y-4">
                            {bioDataFields.map((field, index) => (
                                <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-md">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Field Label (e.g. Student ID)"
                                            value={field.label}
                                            onChange={(e) => updateBioDataField(index, 'label', e.target.value)}
                                            required
                                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                        <div className="flex space-x-4">
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateBioDataField(index, 'type', e.target.value)}
                                                className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">Required</span>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeBioDataField(index)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            {bioDataFields.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No custom fields added.</p>
                            )}
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Questions ({questions.length})</h3>
                        {questions.map((q, idx) => (
                            <div key={idx} className="bg-white shadow sm:rounded-lg p-4 flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-900">{idx + 1}. {q.text}</p>
                                    <p className="text-sm text-gray-500">{q.type} - {q.points} pts</p>
                                    <p className="text-sm text-green-600">Answer: {q.correctAnswer}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(idx)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New Question Form */}
                    <div className="bg-gray-50 shadow sm:rounded-lg p-6 border-2 border-dashed border-gray-300">
                        <h4 className="text-base font-semibold leading-6 text-gray-900 mb-4">Add Question</h4>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-medium leading-6 text-gray-900">Question Text</label>
                                <input
                                    type="text"
                                    value={newQ.text}
                                    onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium leading-6 text-gray-900">Type</label>
                                <select
                                    value={newQ.type}
                                    onChange={(e) => setNewQ({ ...newQ, type: e.target.value as any })}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                    <option value="TRUE_FALSE">True/False</option>
                                    <option value="SHORT_ANSWER">Short Answer</option>
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium leading-6 text-gray-900">Points</label>
                                <input
                                    type="number"
                                    value={newQ.points}
                                    onChange={(e) => setNewQ({ ...newQ, points: parseInt(e.target.value) })}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>

                            {newQ.type === 'MULTIPLE_CHOICE' && (
                                <div className="col-span-full space-y-2">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Options</label>
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
                                            className="block w-full rounded-md border-0 py-1.5 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="col-span-full">
                                <label className="block text-sm font-medium leading-6 text-gray-900">Correct Answer</label>
                                {newQ.type === 'MULTIPLE_CHOICE' ? (
                                    <select
                                        value={newQ.correctAnswer}
                                        onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                )}
                            </div>

                            <div className="col-span-full">
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                >
                                    Add Question
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-x-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
