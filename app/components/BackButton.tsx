'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackButtonProps {
    href?: string
    label?: string
    className?: string
}

export default function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
    const router = useRouter()

    if (href) {
        return (
            <Link
                href={href}
                className={`inline-flex items-center text-sm text-gray-500 hover:text-gray-700 ${className}`}
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                {label}
            </Link>
        )
    }

    return (
        <button
            onClick={() => router.back()}
            className={`inline-flex items-center text-sm text-gray-500 hover:text-gray-700 ${className}`}
        >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {label}
        </button>
    )
}
