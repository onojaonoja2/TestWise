'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'

interface Student {
    name: string
    email: string
    password?: string
}

export default function GroupDetailsPage() {
    const params = useParams()
    const { showToast } = useToast()
    const groupId = params.groupId as string
    const [students, setStudents] = useState<Student[]>([]) // List of students to add
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false)
    const [adding, setAdding] = useState(false)

    // Form state
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

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
                showToast('Students added successfully!', 'success')
                setStudents([])
                // Ideally fetch updated group members here if we were displaying them
            } else {
                const msg = await res.text()
                showToast(`Failed to add students: ${msg}`, 'error')
            }
        } catch (error) {
            showToast('Error adding students', 'error')
        } finally {
            setAdding(false)
        }
    }

    const inputClass =
        'mt-1 block w-full rounded-xl border border-stone-900/10 bg-white shadow-sm px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all'

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <Link href="/dashboard/groups" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-[#C2410C] transition-colors">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Groups
                </Link>
                <h2 className="font-display mt-2 text-2xl font-semibold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Add Students to Group
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                    Add students manually. Accounts will be created for them if they don&apos;t exist.
                </p>
            </div>

            {/* Add Student Form */}
            <div className="paper-card rounded-[1.75rem] p-6">
                <form onSubmit={addStudentToQueue} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-stone-900">Name (Optional)</label>
                            <input
                                type="text"
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-stone-900">Email</label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-stone-900">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm border border-stone-900/10 hover:bg-[#FAF7F1] transition-colors"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5 text-[#C2410C]" aria-hidden="true" />
                            Add to Queue
                        </button>
                    </div>
                </form>
            </div>

            {/* Queue List */}
            {students.length > 0 && (
                <div className="paper-card rounded-[1.5rem] overflow-hidden">
                    <div className="px-6 py-5 bg-[#FAF7F1] border-b border-stone-900/10 flex justify-between items-center">
                        <h3 className="font-display text-lg font-semibold text-stone-900">Students to Add ({students.length})</h3>
                        <button
                            onClick={submitStudents}
                            disabled={adding}
                            className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] disabled:opacity-50 transition-colors"
                        >
                            {adding ? 'Saving...' : 'Save All'}
                        </button>
                    </div>
                    <ul role="list" className="divide-y divide-stone-900/8">
                        {students.map((student, index) => (
                            <li key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-[#FAF7F1] transition-colors">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900">
                                            <span className="text-sm font-semibold leading-none text-[#FFF7ED]">{student.name?.[0] || student.email[0]}</span>
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-stone-900">{student.name || 'No Name'}</p>
                                        <p className="text-sm text-stone-500">{student.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeStudentFromQueue(index)}
                                    className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
