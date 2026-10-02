'use client'

import { useEffect, useRef } from 'react'
import { cn } from 'cn'

type AnimateOnScrollProps = {
    children: React.ReactNode
    className?: string
    delay?: 1 | 2 | 3 | 4 | 5
    once?: boolean
}

export default function AnimateOnScroll({ children, className, delay, once = true }: AnimateOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add('reveal-visible')
                        if (once) observer.unobserve(el)
                    } else if (!once) {
                        el.classList.remove('reveal-visible')
                    }
                })
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [once])

    return (
        <div ref={ref} className={cn('reveal', delay && `reveal-delay-${delay}`, className)}>
            {children}
        </div>
    )
}