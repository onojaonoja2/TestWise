'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BrainCircuit, Menu, X, ArrowRight } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Security', href: '#security' },
    { name: 'Contact', href: '#contact' },
]

export default function LandingNav() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 24)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6">
            <nav
                className={cn(
                    'mx-auto max-w-6xl rounded-2xl border transition-all duration-300',
                    scrolled || mobileOpen ? 'nav-scrolled' : 'nav-idle'
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 sm:px-5">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="bg-[#C2410C] p-2 rounded-xl shadow-[0_8px_20px_-8px_rgba(194,65,12,0.6)] group-hover:bg-[#9A3412] transition-colors">
                            <BrainCircuit className="h-5 w-5 text-[#FFF7ED]" />
                        </div>
                        <span className="leading-none">
                            <span className="block font-display text-[1.35rem] font-semibold tracking-tight text-stone-900">
                                TestWise
                            </span>
                            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                                Exam OS
                            </span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 rounded-full border border-stone-900/8 bg-stone-900/[0.03] p-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-white hover:shadow-sm transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2.5">
                        <Button
                            nativeButton={false}
                            render={<Link href="/auth/signin" />}
                            variant="ghost"
                            className="rounded-full text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-900/5"
                        >
                            Sign in
                        </Button>
                        <Button
                            nativeButton={false}
                            render={<Link href="/auth/signin" />}
                            className="group rounded-full bg-stone-900 text-[#FFF7ED] px-5 h-10 text-sm font-semibold shadow-[0_12px_24px_-12px_rgba(28,25,23,0.6)] hover:bg-[#C2410C] border-0 transition-colors"
                        >
                            Get started
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </div>

                    <button
                        type="button"
                        className="md:hidden -m-2.5 p-2.5 text-stone-700 hover:text-stone-900 transition-colors"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-stone-900/8 px-4 pb-4 pt-2">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-900/5 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <Button
                                    nativeButton={false}
                                    render={<Link href="/auth/signin" onClick={() => setMobileOpen(false)} />}
                                    variant="outline"
                                    className="rounded-full text-stone-800 border-stone-900/15 bg-white"
                                >
                                    Sign in
                                </Button>
                                <Button
                                    nativeButton={false}
                                    render={<Link href="/auth/signin" onClick={() => setMobileOpen(false)} />}
                                    className="rounded-full bg-stone-900 text-[#FFF7ED] border-0"
                                >
                                    Get started
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
