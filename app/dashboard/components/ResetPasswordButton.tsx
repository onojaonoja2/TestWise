'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'
import { passwordStrength } from '@/lib/validators/password'

export default function ResetPasswordButton({
    userId,
    userEmail,
    variant = 'icon',
}: {
    userId: string
    userEmail: string
    variant?: 'icon' | 'button'
}) {
    const { showToast } = useToast()
    const [open, setOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [show, setShow] = useState(false)
    const [saving, setSaving] = useState(false)

    const strength = passwordStrength(newPassword)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch(`/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Reset failed')
            setOpen(false)
            setNewPassword('')
            showToast(`Password reset for ${userEmail}`, 'success')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Reset failed', 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            {variant === 'icon' ? (
                <button
                    onClick={() => setOpen(true)}
                    className="text-stone-400 hover:text-[#C2410C] transition-colors"
                    title={`Reset password for ${userEmail}`}
                    aria-label={`Reset password for ${userEmail}`}
                >
                    <KeyRound className="h-5 w-5" />
                </button>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9A3412] hover:text-[#C2410C] transition-colors"
                >
                    <KeyRound className="h-4 w-4" /> Reset password
                </button>
            )}

            {open && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => !saving && setOpen(false)} />
                    <form
                        onSubmit={handleSubmit}
                        className="paper-card relative w-full max-w-md rounded-[1.75rem] p-6 sm:p-7"
                    >
                        <h3 className="font-display text-xl font-semibold text-stone-900">Reset password</h3>
                        <p className="mt-1 text-sm text-stone-500">
                            Set a new password for <span className="font-semibold text-stone-800">{userEmail}</span>. They can change it later in Settings.
                        </p>
                        <label className="mt-4 block text-sm font-semibold text-stone-800">New password</label>
                        <div className="relative mt-2">
                            <input
                                type={show ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="Min 8 chars, upper, lower, number & symbol"
                                className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 pr-11 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm"
                            />
                            <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 pr-3 text-stone-400 hover:text-stone-700" aria-label="Toggle visibility">
                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? 'bg-[#C2410C]' : 'bg-stone-900/10'}`} />
                                    ))}
                                </div>
                                <p className="mt-1 text-xs text-stone-500">{strength.label}</p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setOpen(false)}
                                className="rounded-full px-4 py-2 text-sm font-semibold text-stone-600 ring-1 ring-inset ring-stone-900/10 hover:bg-stone-900/5 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || newPassword.length < 8}
                                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-[#FFF7ED] hover:bg-[#C2410C] disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Reset password
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}
