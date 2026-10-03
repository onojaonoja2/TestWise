'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, ArrowRight } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'

interface Group {
    id: string
    name: string
    _count: {
        members: number
    }
}

export default function GroupsPage() {
    const { showToast } = useToast()
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
                showToast('Group created successfully!', 'success')
            } else {
                showToast('Failed to create group', 'error')
            }
        } catch (error) {
            showToast('Error creating group', 'error')
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="paper-card rounded-[1.5rem] p-8 text-center text-sm text-stone-500">Loading groups...</div>

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C2410C]">Cohorts</p>
                        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-stone-900">
                            Student Groups
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">Organize students for faster assignment and monitoring.</p>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-inset ring-stone-900/10 hover:bg-stone-900/5 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Create Group Form */}
                <div className="paper-card rounded-[1.75rem] p-6">
                    <h3 className="font-display text-lg font-semibold text-stone-900 mb-4">Create New Group</h3>
                    <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group Name (e.g., Class 10A)"
                            className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newGroupName.trim()}
                            className="inline-flex shrink-0 items-center justify-center rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] disabled:opacity-50 transition-colors"
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
                            <div className="paper-card paper-card-hover relative flex items-center gap-3 rounded-[1.5rem] px-6 py-5">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C2410C]/10">
                                        <Users className="h-6 w-6 text-[#C2410C]" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="font-display text-[15px] font-semibold text-stone-900">{group.name}</p>
                                    <p className="truncate text-sm text-stone-500">
                                        {group._count.members} Students
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <ArrowRight className="h-5 w-5 text-stone-300" />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {groups.length === 0 && (
                        <div className="paper-card col-span-full rounded-[1.5rem] border-dashed text-center py-12">
                            <p className="font-display text-lg font-semibold text-stone-900">No groups yet</p>
                            <p className="mt-1 text-sm text-stone-500">Create your first cohort to organize students.</p>
                        </div>
                    )}
                </div>
        </div>
    )
}
