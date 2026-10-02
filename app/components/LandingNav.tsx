'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BrainCircuit, Menu, X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

const navLinks = [
    { name: 'Features', href: '#features' },
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
        <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6">
            <nav
                className={cn(
                    'mx-auto max-w-5xl rounded-2xl transition-all duration-300',
                    scrolled || mobileOpen ? 'nav-scrolled' : 'glass'
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
                        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/25">
                            <BrainCircuit className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-gray-400">
                            TestWise
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            render={<Link href="/auth/signin" />}
                            variant="ghost"
                            className="rounded-full text-sm font-medium text-gray-300 hover:text-white"
                        >
                            Sign In
                        </Button>
                        <Button
                            render={<Link href="/auth/signin" />}
                            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-400 hover:to-purple-400 border-0 transition-all"
                        >
                            Get Started
                        </Button>
                    </div>

                    <button
                        type="button"
                        className="md:hidden -m-2.5 p-2.5 text-gray-300 hover:text-white transition-colors"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-white/10 px-4 pb-4 pt-2">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <Button
                                    render={<Link href="/auth/signin" onClick={() => setMobileOpen(false)} />}
                                    variant="ghost"
                                    className="rounded-full text-gray-300 hover:text-white"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    render={<Link href="/auth/signin" onClick={() => setMobileOpen(false)} />}
                                    className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 border-0"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}