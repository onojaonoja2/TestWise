'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, ArrowRight } from 'lucide-react'

interface Group {
    id: string
    name: string
    _count: {
        members: number
    }
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [newGroupName, setNewGroupName] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups')
            if (res.ok) {
                const data = await res.json()
                setGroups(data)
            }
        } catch (error) {
            console.error('Failed to fetch groups', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGroupName.trim()) return

        setCreating(true)
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newGroupName })
            })

            if (res.ok) {
                setNewGroupName('')
                fetchGroups()
            } else {
                alert('Failed to create group')
            }
        } catch (error) {
            console.error(error)
            alert('Error creating group')
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Student Groups
                        </h2>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Create Group Form */}
                <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Group</h3>
                    <form onSubmit={handleCreateGroup} className="flex gap-4">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group Name (e.g., Class 10A)"
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newGroupName.trim()}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Create
                        </button>
                    </form>
                </div>

                {/* Groups List */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Link key={group.id} href={`/dashboard/groups/${group.id}`} className="block">
                            <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                        <Users className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{group.name}</p>
                                    <p className="truncate text-sm text-gray-500">
                                        {group._count.members} Students
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {groups.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No groups created yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
