'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Shield, ShieldOff, Eye, EyeOff } from 'lucide-react'
import BackButton from '@/app/components/BackButton'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'
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

export default function OrganizationDetailsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const { data: session } = useSession()
    const { showToast } = useToast()
    const { confirm } = useModal()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', isSubAdmin: false })
    const [showPassword, setShowPassword] = useState(false)
    const [creating, setCreating] = useState(false)

    const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teacherTests, setTeacherTests] = useState<any[]>([])
    const [loadingTests, setLoadingTests] = useState(false)

    const isGlobalAdmin = session?.user?.role === 'ADMIN'

    useEffect(() => {
        fetchUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId])

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/organizations/${orgId}/users`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Failed to fetch users', error)
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
            const res = await fetch(`/api/organizations/${orgId}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })

            if (res.ok) {
                setNewUser({ name: '', email: '', password: '', isSubAdmin: false })
                fetchUsers()
                showToast('User created successfully', 'success')
            } else {
                const msg = await res.text()
                showToast(`Failed to create user: ${msg}`, 'error')
            }
        } catch (error) {
            showToast('Error creating user', 'error')
        } finally {
            setCreating(false)
        }
    }

    const handleToggleSubAdmin = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isSubAdmin: !currentStatus })
            })

            if (res.ok) {
                fetchUsers()
                showToast('User role updated', 'success')
            } else {
                showToast('Failed to update user', 'error')
            }
        } catch (error) {
            showToast('Error updating user', 'error')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        const confirmed = await confirm({
            title: 'Delete User',
            message: 'Are you sure you want to delete this user?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
        })
        if (!confirmed) return

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchUsers()
                showToast('User deleted', 'success')
            } else {
                showToast('Failed to delete user', 'error')
            }
        } catch (error) {
            showToast('Error deleting user', 'error')
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

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
            <div className="mb-2">
                <BackButton href="/dashboard/admin" label="Back to Organizations" className="mb-4" />
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-display text-2xl font-semibold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Organization Users
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">Manage teachers and sub-admins in this organization.</p>
                    </div>
                </div>
            </div>

                {/* Create User Form */}
                <div className="paper-card rounded-[1.75rem] p-6 mb-6">
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
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={newUser.isSubAdmin}
                                    onChange={(e) => setNewUser({ ...newUser, isSubAdmin: e.target.checked })}
                                    className="rounded border-stone-300 text-[#C2410C] focus:ring-[#C2410C]/30"
                                />
                                <span className="text-sm text-stone-600">Make Sub-Admin</span>
                            </label>
                            <button
                                type="submit"
                                disabled={creating || !newUser.name || !newUser.email || !newUser.password}
                                className="inline-flex items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] disabled:opacity-50 transition-colors"
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
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0">
                                            <UserAvatar name={user.name} image={user.image} />
                                        </div>
                                        <div className="ml-4 min-w-0">
                                            <div className="flex items-center">
                                                <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
                                                {user.isSubAdmin && (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-700/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                                        Sub-Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="truncate text-sm text-stone-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3 sm:space-x-4">
                                        <button
                                            onClick={() => handleViewTests(user)}
                                            className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C]"
                                        >
                                            View Tests
                                        </button>
                                        <ResetPasswordButton userId={user.id} userEmail={user.email} />
                                        <button
                                            onClick={() => handleToggleSubAdmin(user.id, user.isSubAdmin)}
                                            className={`text-sm font-medium ${user.isSubAdmin ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'}`}
                                            title={user.isSubAdmin ? "Remove Sub-Admin" : "Make Sub-Admin"}
                                        >
                                            {user.isSubAdmin ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                        </button>

                                        {isGlobalAdmin && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete User"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {users.length === 0 && (
                            <li className="px-4 py-8 text-center text-stone-500">
                                No teachers found in this organization.
                            </li>
                        )}
                    </ul>
                </div>
        </div>
    )
}
