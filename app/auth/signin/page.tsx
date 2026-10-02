'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
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
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 py-12 lg:px-8 overflow-hidden">
            {/* Animated mesh gradient background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="mesh-orb animate-mesh top-[-15%] left-[-10%] h-[30rem] w-[30rem] bg-indigo-600/20" />
                <div className="mesh-orb animate-mesh bottom-[-15%] right-[-10%] h-[30rem] w-[30rem] bg-purple-600/20" style={{ animationDelay: '-8s' }} />
                <div className="mesh-orb animate-mesh bottom-[-5%] left-[30%] h-[24rem] w-[24rem] bg-cyan-500/12" style={{ animationDelay: '-14s' }} />
                <div
                    className="absolute inset-0 opacity-[0.10]"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                        maskImage: "radial-gradient(ellipse at center, black 10%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 75%)",
                    }}
                />
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <Link href="/" className="flex flex-col items-center gap-2 group mb-8">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <BrainCircuit className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gradient animate-gradient bg-gradient-to-r from-white via-indigo-200 to-gray-400">
                        TestWise
                    </span>
                </Link>

                <div className="glass-strong rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-center text-xl font-semibold leading-9 tracking-tight text-white mb-6">
                        Sign in to your account
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
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
                                    className="block w-full rounded-lg border-0 bg-white/5 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
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
                                    className="block w-full rounded-lg border-0 bg-white/5 py-2.5 px-3 pr-10 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex w-full h-11 rounded-lg bg-indigo-600 px-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0"
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

                    <p className="mt-8 text-center text-sm text-gray-400">
                        <Link href="/" className="font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}