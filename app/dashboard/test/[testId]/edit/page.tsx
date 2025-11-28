'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
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

export default function EditTestPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState(60)
    const [visibility, setVisibility] = useState('ORGANIZATION')
    const [allowedEmails, setAllowedEmails] = useState('')
    const [questions, setQuestions] = useState<QuestionDraft[]>([])
    const [bioDataFields, setBioDataFields] = useState<BioDataField[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [published, setPublished] = useState(false)
    const [archived, setArchived] = useState(false)

    // Temporary state for new question being added
    const [newQ, setNewQ] = useState<QuestionDraft>({
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        points: 1,
        correctAnswer: ''
    })

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/tests/${testId}`)
                if (!res.ok) throw new Error("Failed to fetch test")
                const data = await res.json()

                setTitle(data.title)
                setDescription(data.description || '')
                setDuration(data.duration)
                setVisibility(data.visibility)
                setPublished(data.published)
                setArchived(data.archived)
                setQuestions(data.questions || [])
                setBioDataFields(data.bioDataFields || [])

                if (data.allowedUsers) {
                    setAllowedEmails(data.allowedUsers.map((u: any) => u.email).join(', '))
                }
            } catch (error) {
                console.error(error)
                alert("Failed to load test data")
                router.push('/dashboard')
            } finally {
                setLoading(false)
            }
        }
        fetchTest()
    }, [testId, router])

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

        if (!confirm("Saving changes will overwrite existing questions. If students have already taken this test, their answers to deleted questions might be lost or become invalid. Continue?")) {
            return
        }

        setSubmitting(true)
        try {
            const emailList = visibility === 'WHITELIST' ? allowedEmails.split(',').map(e => e.trim()).filter(e => e) : []

            const res = await fetch(`/api/tests/${testId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    duration,
                    visibility,
                    published,
                    archived,
                    allowedEmails: emailList,
                    questions,
                    bioDataFields
                })
            })

            if (res.ok) {
                router.push('/dashboard')
                router.refresh()
            } else {
                const msg = await res.text()
                console.error(`Failed to update test: ${msg}`)
                alert(`Failed to update test. Check console for details.`)
                setSubmitting(false)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to update test. Check console for details.')
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading test data...</div>

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Edit Test: {title}
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

                            {visibility === 'WHITELIST' && (
                                <div className="col-span-full">
                                    <label htmlFor="allowedEmails" className="block text-sm font-medium leading-6 text-gray-900">
                                        Allowed Emails (comma separated)
                                    </label>
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

                            <div className="col-span-full flex space-x-6">
                                <div className="relative flex gap-x-3">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="published"
                                            name="published"
                                            type="checkbox"
                                            checked={published}
                                            onChange={(e) => setPublished(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                    </div>
                                    <div className="text-sm leading-6">
                                        <label htmlFor="published" className="font-medium text-gray-900">Published</label>
                                        <p className="text-gray-500">Make this test available to students.</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-x-3">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="archived"
                                            name="archived"
                                            type="checkbox"
                                            checked={archived}
                                            onChange={(e) => setArchived(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                    </div>
                                    <div className="text-sm leading-6">
                                        <label htmlFor="archived" className="font-medium text-gray-900">Archived</label>
                                        <p className="text-gray-500">Hide this test from lists but keep data.</p>
                                    </div>
                                </div>
                            </div>
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
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    )
}
