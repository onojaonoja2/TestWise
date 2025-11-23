'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, UserPlus } from 'lucide-react'

interface Student {
    name: string
    email: string
    password?: string
}

export default function GroupDetailsPage() {
    const params = useParams()
    const groupId = params.groupId as string
    const [students, setStudents] = useState<Student[]>([]) // List of students to add
    const [loading, setLoading] = useState(false)
    const [adding, setAdding] = useState(false)

    // Form state
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const addStudentToQueue = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail || !newPassword) return

        setStudents([...students, { name: newName, email: newEmail, password: newPassword }])
        setNewName('')
        setNewEmail('')
        setNewPassword('')
    }

    const removeStudentFromQueue = (index: number) => {
        const newStudents = [...students]
        newStudents.splice(index, 1)
        setStudents(newStudents)
    }

    const submitStudents = async () => {
        if (students.length === 0) return

        setAdding(true)
        try {
            const res = await fetch(`/api/groups/${groupId}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students })
            })

            if (res.ok) {
                alert('Students added successfully!')
                setStudents([])
                // Ideally fetch updated group members here if we were displaying them
            } else {
                alert('Failed to add students')
            }
        } catch (error) {
            console.error(error)
            alert('Error adding students')
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/dashboard/groups" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Groups
                    </Link>
                    <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Add Students to Group
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Add students manually. Accounts will be created for them if they don't exist.
                    </p>
                </div>

                {/* Add Student Form */}
                <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                    <form onSubmit={addStudentToQueue} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="text"
                                    id="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Add to Queue
                            </button>
                        </div>
                    </form>
                </div>

                {/* Queue List */}
                {students.length > 0 && (
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Students to Add ({students.length})</h3>
                            <button
                                onClick={submitStudents}
                                disabled={adding}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            >
                                {adding ? 'Saving...' : 'Save All'}
                            </button>
                        </div>
                        <ul role="list" className="divide-y divide-gray-200">
                            {students.map((student, index) => (
                                <li key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                                <span className="text-sm font-medium leading-none text-gray-500">{student.name?.[0] || student.email[0]}</span>
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">{student.name || 'No Name'}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                            <p className="text-xs text-gray-400">Pass: {student.password}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeStudentFromQueue(index)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
