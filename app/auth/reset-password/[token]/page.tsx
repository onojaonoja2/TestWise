'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrainCircuit, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { passwordStrength } from '@/lib/validators/password'

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter()
    const { token } = use(params)
    const [newPassword, setNewPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    const strength = passwordStrength(newPassword)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirm) {
            setError('Passwords do not match')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || 'Reset failed')
                return
            }
            setDone(true)
            setTimeout(() => router.push('/auth/signin'), 2500)
        } catch {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAF7F1] px-6 py-12 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="mesh-orb animate-mesh top-[-12%] left-[-8%] h-[26rem] w-[26rem] bg-[#C2410C]/12" />
                <div className="absolute inset-0 dot-grid-warm opacity-40 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_40%,black,transparent)]" />
            </div>
            <div className="relative w-full sm:mx-auto sm:max-w-md">
                <div className="paper-card rounded-[1.75rem] p-8">
                    {done ? (
                        <div className="text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
                            <h2 className="mt-4 font-display text-2xl font-semibold text-stone-900">Password reset</h2>
                            <p className="mt-2 text-sm text-stone-500">You can now sign in with your new password. Redirecting...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center"><div className="bg-[#C2410C] p-2.5 rounded-2xl"><BrainCircuit className="h-6 w-6 text-white" /></div></div>
                            <h2 className="mt-4 font-display text-2xl font-semibold text-stone-900 text-center">Set a new password</h2>
                            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                                {[
                                    { label: 'New password', value: newPassword, set: setNewPassword },
                                    { label: 'Confirm password', value: confirm, set: setConfirm },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <label className="block text-sm font-semibold text-stone-800">{f.label}</label>
                                        <div className="relative mt-2">
                                            <input
                                                type={show ? 'text' : 'password'} required value={f.value} onChange={(e) => f.set(e.target.value)}
                                                className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 pr-11 text-stone-900 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm"
                                            />
                                            <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 pr-3.5 text-stone-400 hover:text-stone-700" aria-label="Toggle visibility">
                                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {newPassword && (
                                    <div>
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2, 3].map((i) => (
                                                <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? 'bg-[#C2410C]' : 'bg-stone-900/10'}`} />
                                            ))}
                                        </div>
                                        <p className="mt-1.5 text-xs text-stone-500">{strength.label} · min 8 chars, upper, lower, number & symbol</p>
                                    </div>
                                )}
                                {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-700 text-center">{error}</div>}
                                <Button type="submit" disabled={loading || !token} className="flex w-full h-11 rounded-full bg-stone-900 text-[#FFF7ED] border-0 hover:bg-[#C2410C] disabled:opacity-50">
                                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</> : 'Reset password'}
                                </Button>
                            </form>
                            <p className="mt-6 text-center text-sm text-stone-500">
                                <Link href="/auth/signin" className="font-semibold text-[#9A3412] hover:text-[#C2410C]">Back to sign in</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
