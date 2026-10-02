'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignIn() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError('Invalid credentials')
                setLoading(false)
                return
            }

            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            console.error(error)
            setError('Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAF7F1] px-6 py-12 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="mesh-orb animate-mesh top-[-12%] left-[-8%] h-[26rem] w-[26rem] bg-[#C2410C]/12" />
                <div className="mesh-orb animate-mesh bottom-[-12%] right-[-8%] h-[26rem] w-[26rem] bg-amber-400/20" style={{ animationDelay: '-8s' }} />
                <div className="absolute inset-0 dot-grid-warm opacity-40 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_40%,black,transparent)]" />
            </div>

            <div className="relative w-full sm:mx-auto sm:max-w-md">
                <Link href="/" className="flex flex-col items-center gap-2.5 group mb-8">
                    <div className="bg-[#C2410C] p-2.5 rounded-2xl shadow-[0_12px_24px_-12px_rgba(194,65,12,0.6)] group-hover:bg-[#9A3412] transition-colors">
                        <BrainCircuit className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-center leading-none">
                        <span className="block font-display text-3xl font-semibold tracking-tight text-stone-900">
                            TestWise
                        </span>
                        <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
                            Smart Exam OS
                        </span>
                    </span>
                </Link>

                <div className="paper-card rounded-[1.75rem] p-8">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 text-center">
                        Welcome back
                    </h2>
                    <p className="mt-1.5 text-center text-sm text-stone-500">
                        Sign in to run your next secure exam.
                    </p>

                    <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-stone-800">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                    placeholder="you@school.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-semibold text-stone-800">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 pr-11 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200 text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex w-full h-11 rounded-full bg-stone-900 px-3 text-sm font-semibold text-[#FFF7ED] border-0 shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-stone-500">
                        <ShieldCheck className="h-4 w-4 text-[#C2410C]" />
                        Protected by session monitoring &amp; encryption
                    </p>

                    <p className="mt-6 text-center text-sm text-stone-500">
                        <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
