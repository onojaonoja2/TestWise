'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrainCircuit, ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            setSent(true)
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
                <Link href="/" className="flex flex-col items-center gap-2.5 mb-8">
                    <div className="bg-[#C2410C] p-2.5 rounded-2xl">
                        <BrainCircuit className="h-7 w-7 text-white" />
                    </div>
                    <span className="font-display text-3xl font-semibold tracking-tight text-stone-900">TestWise</span>
                </Link>
                <div className="paper-card rounded-[1.75rem] p-8">
                    {sent ? (
                        <div className="text-center">
                            <MailCheck className="mx-auto h-12 w-12 text-[#C2410C]" />
                            <h2 className="mt-4 font-display text-2xl font-semibold text-stone-900">Check your inbox</h2>
                            <p className="mt-2 text-sm text-stone-500">If an account exists for {email}, a reset link is on its way. It expires in 1 hour.</p>
                            <Link href="/auth/signin" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9A3412] hover:text-[#C2410C]">
                                <ArrowLeft className="h-4 w-4" /> Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 text-center">Forgot password</h2>
                            <p className="mt-1.5 text-center text-sm text-stone-500">Enter your account email and we&apos;ll send a reset link.</p>
                            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-stone-800">Email address</label>
                                    <input
                                        id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@school.edu"
                                        className="mt-2 block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                    />
                                </div>
                                <Button type="submit" disabled={loading || !email} className="flex w-full h-11 rounded-full bg-stone-900 text-[#FFF7ED] border-0 hover:bg-[#C2410C] disabled:opacity-50">
                                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : 'Send reset link'}
                                </Button>
                            </form>
                            <p className="mt-6 text-center text-sm text-stone-500">
                                <Link href="/auth/signin" className="inline-flex items-center gap-1.5 font-semibold text-[#9A3412] hover:text-[#C2410C]">
                                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
