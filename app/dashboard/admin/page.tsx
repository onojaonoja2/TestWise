'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Building2, Users, ArrowRight } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'

interface Organization {
    id: string
    name: string
    createdAt: string
    _count: {
        users: number
    }
}

export default function AdminDashboard() {
    const { showToast } = useToast()
    const { confirm } = useModal()
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [newOrgName, setNewOrgName] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchOrganizations()
    }, [])

    const fetchOrganizations = async () => {
        try {
            const res = await fetch('/api/organizations')
            if (res.ok) {
                const data = await res.json()
                setOrganizations(data)
            }
        } catch (error) {
            console.error('Failed to fetch organizations', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newOrgName.trim()) return

        setCreating(true)
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName })
            })

            if (res.ok) {
                setNewOrgName('')
                fetchOrganizations()
                showToast('Organization created', 'success')
            } else {
                showToast('Failed to create organization', 'error')
            }
        } catch (error) {
            showToast('Error creating organization', 'error')
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-stone-500">Loading...</div>

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-2xl font-semibold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Organization Management
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                        Create and manage organizations across the workspace.
                    </p>
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

            {/* Create Organization Form */}
            <div className="paper-card rounded-[1.75rem] p-6">
                <h3 className="font-display text-lg font-semibold text-stone-900 mb-4">Create New Organization</h3>
                <form onSubmit={handleCreateOrg} className="flex gap-3">
                    <input
                        type="text"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Organization Name"
                        className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                    />
                    <button
                        type="submit"
                        disabled={creating || !newOrgName.trim()}
                        className="inline-flex shrink-0 items-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] disabled:opacity-50 transition-colors"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Create
                    </button>
                </form>
            </div>

            {/* Organizations List */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                    <div key={org.id} className="paper-card paper-card-hover relative flex items-center space-x-3 rounded-2xl px-6 py-5 focus-within:ring-2 focus-within:ring-[#C2410C]/30">
                        <div className="flex-shrink-0">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C2410C]">
                                <Building2 className="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link href={`/dashboard/admin/organizations/${org.id}`} className="focus:outline-none">
                                <span className="absolute inset-0" aria-hidden="true" />
                                <p className="text-sm font-semibold text-stone-900">{org.name}</p>
                                <p className="truncate text-sm text-stone-500 flex items-center mt-1">
                                    <Users className="h-4 w-4 mr-1" />
                                    {org._count.users} Members
                                </p>
                            </Link>
                        </div>
                        <div className="flex-shrink-0 flex items-center space-x-2 relative z-10">
                            <Link href={`/dashboard/admin/organizations/${org.id}`} className="text-stone-400 hover:text-[#C2410C] transition-colors">
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <button
                                onClick={async (e) => {
                                    e.preventDefault()
                                    const confirmed = await confirm({
                                        title: 'Delete Organization',
                                        message: `Are you sure you want to delete ${org.name}? This will delete ALL users and data associated with it.`,
                                        confirmText: 'Delete',
                                        cancelText: 'Cancel',
                                        type: 'danger',
                                    })
                                    if (!confirmed) return
                                    fetch(`/api/organizations/${org.id}`, { method: 'DELETE' })
                                        .then(res => {
                                            if (res.ok) {
                                                fetchOrganizations()
                                                showToast('Organization deleted', 'success')
                                            }
                                            else showToast('Failed to delete organization', 'error')
                                        })
                                }}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Delete Organization"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
