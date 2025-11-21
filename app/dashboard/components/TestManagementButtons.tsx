'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TestManagementButtonsProps {
    testId: string
    published: boolean
    archived: boolean
}

export default function TestManagementButtons({ testId, published, archived }: TestManagementButtonsProps) {
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

    if (loading) {
        return <span className="text-gray-400 text-sm">Updating...</span>
    }

    return (
        <div className="flex space-x-2 text-sm">
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
        </div>
    )
}
