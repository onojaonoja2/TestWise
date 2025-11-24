'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Building2, Users, ArrowRight } from 'lucide-react'

interface Organization {
    id: string
    name: string
    createdAt: string
    _count: {
        users: number
    }
}

export default function AdminDashboard() {
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
            } else {
                alert('Failed to create organization')
            }
        } catch (error) {
            console.error(error)
            alert('Error creating organization')
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
                            Organization Management
                        </h2>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <Link
                            href="/api/auth/signout"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Sign out
                        </Link>
                    </div>
                </div>

                {/* Create Organization Form */}
                <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Organization</h3>
                    <form onSubmit={handleCreateOrg} className="flex gap-4">
                        <input
                            type="text"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            placeholder="Organization Name"
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newOrgName.trim()}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Create
                        </button>
                    </form>
                </div>

                {/* Organizations List */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => (
                        <div key={org.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                            <div className="flex-shrink-0">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500">
                                    <Building2 className="h-6 w-6 text-white" aria-hidden="true" />
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <Link href={`/dashboard/admin/organizations/${org.id}`} className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{org.name}</p>
                                    <p className="truncate text-sm text-gray-500 flex items-center mt-1">
                                        <Users className="h-4 w-4 mr-1" />
                                        {org._count.users} Members
                                    </p>
                                </Link>
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-2 relative z-10">
                                <Link href={`/dashboard/admin/organizations/${org.id}`} className="text-gray-400 hover:text-gray-500">
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (confirm(`Are you sure you want to delete ${org.name}? This will delete ALL users and data associated with it.`)) {
                                            // Call delete API
                                            fetch(`/api/organizations/${org.id}`, { method: 'DELETE' })
                                                .then(res => {
                                                    if (res.ok) fetchOrganizations()
                                                    else alert('Failed to delete organization')
                                                })
                                        }
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
        </div>
    )
}
