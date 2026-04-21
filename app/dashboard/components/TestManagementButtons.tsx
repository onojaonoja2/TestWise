'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TestManagementButtonsProps {
    testId: string
    published: boolean
    archived: boolean
    visibility: string
    submissionCount: number
}

export default function TestManagementButtons({ testId, published, archived, visibility, submissionCount }: TestManagementButtonsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const updateStatus = async (updates: { published?: boolean; archived?: boolean }) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/tests/${testId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert("Failed to update test status")
            }
        } catch (error) {
            console.error("Failed to update test", error)
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const deleteTest = async () => {
        if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/tests/${testId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert("Failed to delete test")
            }
        } catch (error) {
            console.error("Failed to delete test", error)
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <span className="text-gray-400 text-sm">Updating...</span>
    }

    const copyLink = () => {
        const link = `${window.location.origin}/test/${testId}`
        navigator.clipboard.writeText(link)
        alert("Link copied to clipboard!")
    }

    const isEditable = !published && submissionCount === 0

    return (
        <div className="grid grid-cols-2 gap-2 text-sm">
            {isEditable ? (
                <Link
                    href={`/dashboard/test/${testId}/edit`}
                    className="px-3 py-1.5 text-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-indigo-300 font-medium transition-colors"
                >
                    Edit
                </Link>
            ) : (
                <span className="px-3 py-1.5 text-center rounded-md border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed" title="Cannot edit published test or test with submissions">
                    Edit
                </span>
            )}

            {!archived && (
                <button
                    onClick={() => updateStatus({ published: !published })}
                    className={`px-3 py-1.5 text-center rounded-md border font-medium transition-colors ${published ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                    {published ? 'Unpublish' : 'Publish'}
                </button>
            )}

            <button
                onClick={() => updateStatus({ archived: !archived })}
                className={`px-3 py-1.5 text-center rounded-md border font-medium transition-colors ${archived ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}
            >
                {archived ? 'Restore' : 'Archive'}
            </button>

            {isEditable ? (
                <button
                    onClick={deleteTest}
                    className="px-3 py-1.5 text-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
                >
                    Delete
                </button>
            ) : (
                <span className="px-3 py-1.5 text-center rounded-md border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed" title="Cannot delete published test or test with submissions">
                    Delete
                </span>
            )}

            {visibility === 'PUBLIC' && (
                <button
                    onClick={copyLink}
                    className="px-3 py-1.5 text-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
                    title="Copy Public Link"
                >
                    Copy Link
                </button>
            )}
        </div>
    )
}
