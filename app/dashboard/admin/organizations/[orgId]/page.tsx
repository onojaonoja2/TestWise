'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Shield, ShieldOff, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import BackButton from '@/app/components/BackButton'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'

interface User {
    id: string
    name: string
    email: string
    role: string
    isSubAdmin: boolean
    createdAt: string
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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Tests by {selectedTeacher.name}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">{selectedTeacher.email}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => fetchTeacherTests(selectedTeacher.id)}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => setSelectedTeacher(null)}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Back to Teachers
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        {loadingTests ? (
                            <div className="p-8 text-center">Loading tests...</div>
                        ) : (
                            <ul role="list" className="divide-y divide-gray-200">
                                {teacherTests.map((test) => (
                                    <li key={test.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-indigo-600">{test.title}</h3>
                                                <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                                                    <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${test.archived ? 'bg-gray-100 text-gray-800' :
                                                        test.published ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {test.archived ? 'Archived' : test.published ? 'Published' : 'Draft'}
                                                    </span>
                                                    {test.isPublic && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                            Public
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <a
                                                    href={`/dashboard/test/${test.id}/results`}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
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
                                    <li className="px-4 py-8 text-center text-gray-500">
                                        No tests found for this teacher.
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <BackButton href="/dashboard/admin" label="Back to Organizations" className="mb-4" />
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Organization Users
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Create User Form */}
                <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Teacher</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Name"
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="Email"
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Password"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={newUser.isSubAdmin}
                                    onChange={(e) => setNewUser({ ...newUser, isSubAdmin: e.target.checked })}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Make Sub-Admin</span>
                            </label>
                            <button
                                type="submit"
                                disabled={creating || !newUser.name || !newUser.email || !newUser.password}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            >
                                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Add Teacher
                            </button>
                        </div>
                    </form>
                </div>

                {/* Users List */}
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <ul role="list" className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                                                <UserIcon className="h-6 w-6 text-white" />
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <p className="truncate text-sm font-medium text-indigo-600">{user.name}</p>
                                                {user.isSubAdmin && (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        Sub-Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleViewTests(user)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                        >
                                            View Tests
                                        </button>
                                        <button
                                            onClick={() => handleToggleSubAdmin(user.id, user.isSubAdmin)}
                                            className={`text-sm font-medium ${user.isSubAdmin ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                            title={user.isSubAdmin ? "Remove Sub-Admin" : "Make Sub-Admin"}
                                        >
                                            {user.isSubAdmin ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                        </button>

                                        {isGlobalAdmin && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900"
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
                            <li className="px-4 py-8 text-center text-gray-500">
                                No teachers found in this organization.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
