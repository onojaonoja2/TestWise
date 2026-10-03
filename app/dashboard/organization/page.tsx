'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Plus, Edit2, X, Check, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'
import ResetPasswordButton from '@/app/dashboard/components/ResetPasswordButton'

interface User {
    id: string
    name: string
    email: string
    role: string
    image?: string | null
    isSubAdmin: boolean
    createdAt: string
}

function UserAvatar({ name, image }: { name: string; image?: string | null }) {
    if (image) {
        return <img src={image} alt={name} className="h-10 w-10 rounded-full border border-stone-900/10 object-cover bg-white" />
    }
    const initials = name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'U'
    return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-[#FFF7ED]">
            {initials}
        </span>
    )
}

export default function OrganizationManagementPage() {
    const { data: session } = useSession()
    const { showToast } = useToast()
    const [users, setUsers] = useState<User[]>([])
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [creating, setCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', email: '' })

    const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teacherTests, setTeacherTests] = useState<any[]>([])
    const [loadingTests, setLoadingTests] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.organizationId) {
            fetchUsers()
        } else if (session && !session.user.organizationId) {
            // Not in an organization
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const fetchUsers = async () => {
        if (!session?.user?.organizationId) return
        try {
            const res = await fetch(`/api/organizations/${session.user.organizationId}/users`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            } else {
                showToast('Failed to load users', 'error')
            }
        } catch (error) {
            console.error('Failed to fetch users', error)
            showToast('Failed to load users', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchTeacherTests = async (userId: string) => {
        setLoadingTests(true)
        try {
            const res = await fetch(`/api/users/${userId}/tests`)
            if (res.ok) {
                const data = await res.json()
                setTeacherTests(data)
            }
        } catch (error) {
            console.error('Failed to fetch tests', error)
            showToast('Failed to fetch tests', 'error')
        } finally {
            setLoadingTests(false)
        }
    }

    const handleViewTests = (user: User) => {
        setSelectedTeacher(user)
        fetchTeacherTests(user.id)
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUser.name || !newUser.email || !newUser.password) return

        setCreating(true)
        try {
            const res = await fetch(`/api/organizations/${session?.user?.organizationId}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })

            if (res.ok) {
                setNewUser({ name: '', email: '', password: '' })
                fetchUsers()
                showToast('Teacher added successfully', 'success')
            } else {
                const msg = await res.text()
                showToast(`Failed to create user: ${msg}`, 'error')
            }
        } catch (error) {
            console.error(error)
            showToast('Error creating user', 'error')
        } finally {
            setCreating(false)
        }
    }

    const startEditing = (user: User) => {
        setEditingId(user.id)
        setEditForm({ name: user.name, email: user.email })
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditForm({ name: '', email: '' })
    }

    const saveEdit = async (userId: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            })

            if (res.ok) {
                setEditingId(null)
                fetchUsers()
                showToast('User updated', 'success')
            } else {
                showToast('Failed to update user', 'error')
            }
        } catch (error) {
            console.error(error)
            showToast('Error updating user', 'error')
        }
    }

    if (loading) return <div className="p-8 text-center text-stone-500">Loading...</div>

    if (!session?.user?.isSubAdmin) {
        return <div className="p-8 text-center text-red-600">Unauthorized: You must be a Sub-Admin to view this page.</div>
    }

    if (selectedTeacher) {
        return (
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display text-2xl font-semibold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Tests by {selectedTeacher.name}
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">{selectedTeacher.email}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => fetchTeacherTests(selectedTeacher.id)}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#9A3412] shadow-sm border border-stone-900/10 hover:bg-[#FFF7ED] transition-colors"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => setSelectedTeacher(null)}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm border border-stone-900/10 hover:bg-[#FAF7F1] transition-colors"
                        >
                            Back to Teachers
                        </button>
                    </div>
                </div>

                <div className="paper-card overflow-hidden rounded-[1.5rem]">
                    {loadingTests ? (
                        <div className="p-8 text-center text-stone-500">Loading tests...</div>
                    ) : (
                        <ul role="list" className="divide-y divide-stone-900/8">
                            {teacherTests.map((test) => (
                                <li key={test.id} className="px-4 py-4 sm:px-6 hover:bg-[#FAF7F1] transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-display text-lg font-semibold text-stone-900">{test.title}</h3>
                                            <div className="mt-1 flex items-center space-x-2 text-sm text-stone-500">
                                                <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${test.archived ? 'bg-stone-900/8 text-stone-600' :
                                                    test.published ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {test.archived ? 'Archived' : test.published ? 'Published' : 'Draft'}
                                                </span>
                                                {test.isPublic && (
                                                    <span className="inline-flex items-center rounded-full bg-[#C2410C]/10 px-2.5 py-0.5 text-xs font-semibold text-[#9A3412]">
                                                        Public
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <a
                                                href={`/dashboard/test/${test.id}/results`}
                                                className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Results
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {teacherTests.length === 0 && (
                                <li className="px-4 py-8 text-center text-stone-500">
                                    No tests found for this teacher.
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-2xl font-semibold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Manage Organization
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">Add teachers and manage your workspace members.</p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/api/auth/signout"
                        className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm border border-stone-900/10 hover:bg-[#FAF7F1] transition-colors"
                    >
                        Sign out
                    </Link>
                </div>
            </div>

            {/* Create User Form */}
            <div className="paper-card rounded-[1.75rem] p-6">
                <h3 className="font-display text-lg font-semibold text-stone-900 mb-4">Add New Teacher</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Name"
                            className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                        />
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="Email"
                            className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Password"
                                className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 pr-10 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={creating || !newUser.name || !newUser.email || !newUser.password}
                            className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] disabled:opacity-50 transition-colors"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Add Teacher
                        </button>
                    </div>
                </form>
            </div>

            {/* Users List */}
            <div className="paper-card overflow-hidden sm:rounded-[1.5rem]">
                <ul role="list" className="divide-y divide-stone-900/8">
                    {users.map((user) => (
                        <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-[#FAF7F1] transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        <UserAvatar name={user.name} image={user.image} />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        {editingId === user.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="block w-full rounded-xl border border-stone-900/10 bg-white py-2 px-3 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                                />
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="block w-full rounded-xl border border-stone-900/10 bg-white py-2 px-3 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center">
                                                    <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
                                                    {user.isSubAdmin && (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-700/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                                            Sub-Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-stone-500">{user.email}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 ml-4">
                                    <button
                                        onClick={() => handleViewTests(user)}
                                        className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors"
                                    >
                                        View Tests
                                    </button>
                                    <ResetPasswordButton userId={user.id} userEmail={user.email} />
                                    {editingId === user.id ? (
                                        <>
                                            <button
                                                onClick={() => saveEdit(user.id)}
                                                className="text-emerald-700 hover:text-emerald-900"
                                                title="Save"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="text-red-500 hover:text-red-700"
                                                title="Cancel"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(user)}
                                            className="text-stone-400 hover:text-stone-700"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                    {users.length === 0 && (
                        <li className="px-4 py-8 text-center text-stone-500">
                            No teachers found in your organization.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
