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
        <div className="flex space-x-2 text-sm items-center">
            {visibility === 'PUBLIC' && (
                <>
                    <button
                        onClick={copyLink}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                        title="Copy Public Link"
                    >
                        Copy Link
                    </button>
                    <span className="text-gray-300">|</span>
                </>
            )}

            {isEditable ? (
                <Link
                    href={`/dashboard/test/${testId}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    Edit
                </Link>
            ) : (
                <span className="text-gray-400 cursor-not-allowed" title="Cannot edit published test or test with submissions">
                    Edit
                </span>
            )}
            <span className="text-gray-300">|</span>

            {!archived && (
                <>
                    <button
                        onClick={() => updateStatus({ published: !published })}
                        className={`${published ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} font-medium`}
                    >
                        {published ? 'Unpublish' : 'Publish'}
                    </button>
                    <span className="text-gray-300">|</span>
                </>
            )}

            <button
                onClick={() => updateStatus({ archived: !archived })}
                className={`${archived ? 'text-blue-600 hover:text-blue-900' : 'text-red-600 hover:text-red-900'} font-medium`}
            >
                {archived ? 'Restore' : 'Archive'}
            </button>

            <span className="text-gray-300">|</span>
            {isEditable ? (
                <button
                    onClick={deleteTest}
                    className="text-red-600 hover:text-red-900 font-medium"
                >
                    Delete
                </button>
            ) : (
                <span className="text-gray-400 cursor-not-allowed" title="Cannot delete published test or test with submissions">
                    Delete
                </span>
            )}
        </div>
    )
}
