'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'

interface TestManagementButtonsProps {
    testId: string
    published: boolean
    archived: boolean
    visibility: string
    submissionCount: number
}

export default function TestManagementButtons({ testId, published, archived, visibility, submissionCount }: TestManagementButtonsProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const { confirm } = useModal()
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
                showToast('Failed to update test status', 'error')
            }
        } catch (error) {
            showToast('An error occurred', 'error')
        } finally {
            setLoading(false)
        }
    }

    const deleteTest = async () => {
        const confirmed = await confirm({
          title: 'Delete Test',
          message: 'Are you sure you want to delete this test? This action cannot be undone.',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          type: 'danger',
        })
        if (!confirmed) return

        setLoading(true)
        try {
            const res = await fetch(`/api/tests/${testId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                router.refresh()
            } else {
                showToast('Failed to delete test', 'error')
            }
        } catch (error) {
            showToast('An error occurred', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <span className="text-stone-400 text-sm">Updating...</span>
    }

    const copyLink = () => {
        const link = `${window.location.origin}/test/${testId}`
        navigator.clipboard.writeText(link)
        showToast('Link copied to clipboard!', 'success')
    }

    const isEditable = !published && submissionCount === 0

    return (
        <div className="grid grid-cols-2 gap-2 text-sm">
            {isEditable ? (
                <Link
                    href={`/dashboard/test/${testId}/edit`}
                    className="px-3 py-1.5 text-center rounded-xl border border-stone-900/10 bg-white text-stone-700 hover:bg-stone-900/5 hover:border-[#C2410C]/30 font-medium transition-colors"
                >
                    Edit
                </Link>
            ) : (
                <span className="px-3 py-1.5 text-center rounded-xl border border-stone-900/5 bg-stone-900/[0.03] text-stone-400 cursor-not-allowed" title="Cannot edit published test or test with submissions">
                    Edit
                </span>
            )}

            {!archived && (
                <button
                    onClick={() => updateStatus({ published: !published })}
                    className={`px-3 py-1.5 text-center rounded-xl border font-medium transition-colors ${published ? 'border-amber-600/20 bg-amber-100 text-amber-900 hover:bg-amber-200/60' : 'border-emerald-700/20 bg-emerald-700/10 text-emerald-800 hover:bg-emerald-700/20'}`}
                >
                    {published ? 'Unpublish' : 'Publish'}
                </button>
            )}

            <button
                onClick={() => updateStatus({ archived: !archived })}
                className={`px-3 py-1.5 text-center rounded-xl border font-medium transition-colors ${archived ? 'border-stone-900/15 bg-stone-900 text-[#FFF7ED] hover:bg-[#C2410C]' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}
            >
                {archived ? 'Restore' : 'Archive'}
            </button>

            {isEditable ? (
                <button
                    onClick={deleteTest}
                    className="px-3 py-1.5 text-center rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
                >
                    Delete
                </button>
            ) : (
                <span className="px-3 py-1.5 text-center rounded-xl border border-stone-900/5 bg-stone-900/[0.03] text-stone-400 cursor-not-allowed" title="Cannot delete published test or test with submissions">
                    Delete
                </span>
            )}

            {visibility === 'PUBLIC' && (
                <button
                    onClick={copyLink}
                    className="px-3 py-1.5 text-center rounded-xl border border-[#C2410C]/25 bg-[#C2410C]/10 text-[#9A3412] hover:bg-[#C2410C]/20 font-medium transition-colors"
                    title="Copy Public Link"
                >
                    Copy Link
                </button>
            )}
        </div>
    )
}
