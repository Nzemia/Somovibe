"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Store, ShoppingBag } from "lucide-react"

const PHRASES = [
    "Schemes of work.",
    "Lesson plans.",
    "Predictions.",
    "Practical guides.",
] as const

const DWELL_MS = 2400
const TRANSITION_MS = 250

const FOLD_ICONS = [
    { src: "/icons/fold-cash.png", wash: "bg-fold-cash/25" },
    { src: "/icons/fold-heart.png", wash: "bg-fold-heart/25" },
    { src: "/icons/fold-folder.png", wash: "bg-fold-folder/25" },
    { src: "/icons/fold-thumb.png", wash: "bg-fold-thumb/25" },
] as const

function FoldShapes({ motion }: { motion: boolean }) {
    return (
        <div
            aria-hidden="true"
            className="flex items-center justify-center gap-space-3"
        >
            {FOLD_ICONS.map(({ src, wash }, i) => (
                <span
                    key={src}
                    className={cn(
                        "flex size-space-8 items-center justify-center rounded-full",
                        wash,
                        motion
                            ? `fold-icon-motion fold-icon-motion-${i + 1}`
                            : "fold-icon-motion-paused"
                    )}
                >
                    <Image
                        src={src}
                        alt=""
                        width={128}
                        height={128}
                        className="size-space-8 object-contain saturate-150"
                    />
                </span>
            ))}
        </div>
    )
}

export function Fold() {
    const sectionRef = useRef<HTMLElement>(null)
    const headingRef = useRef<HTMLHeadingElement>(null)
    const measureRef = useRef<HTMLDivElement>(null)

    const [index, setIndex] = useState(0)
    const [inView, setInView] = useState(true)
    const [reduced, setReduced] = useState(false)
    const [mask, setMask] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        const node = sectionRef.current
        if (!node) return
        const io = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0 }
        )
        io.observe(node)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (!inView) return
        const id = window.setInterval(() => {
            setIndex((current) => (current + 1) % PHRASES.length)
        }, DWELL_MS)
        return () => window.clearInterval(id)
    }, [inView])

    useLayoutEffect(() => {
        const heading = headingRef.current
        const box = measureRef.current
        if (!heading || !box) return

        const measure = () => {
            let width = 0
            let height = 0
            for (const child of box.children) {
                const el = child as HTMLElement
                width = Math.max(width, el.offsetWidth)
                height = Math.max(height, el.offsetHeight)
            }
            setMask({ width, height })
        }

        const ro = new ResizeObserver(measure)
        ro.observe(heading)
        measure()
        let cancelled = false
        document.fonts.ready.then(() => {
            if (!cancelled) measure()
        })
        return () => {
            cancelled = true
            ro.disconnect()
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            aria-labelledby="fold-heading"
            className="flex min-h-[calc(100dvh-var(--header-height))] flex-col items-center justify-center gap-space-6 bg-surface px-space-4 py-space-6 text-center sm:py-space-8"
        >
            <FoldShapes motion={inView && !reduced} />

            <div className="flex w-full flex-col items-center gap-space-5">
            <h1
                id="fold-heading"
                ref={headingRef}
                className="relative w-full font-bold text-text-primary"
            >
                <span
                    className="relative mx-auto block overflow-hidden font-sans text-display font-bold text-primary"
                    style={{
                        width: mask.width > 0 ? mask.width : "100%",
                        height: mask.height > 0 ? mask.height : "1lh",
                    }}
                >
                    {PHRASES.map((phrase, i) => {
                        const isCurrent = i === index
                        const isPrevious =
                            i === (index + PHRASES.length - 1) % PHRASES.length
                        let y = "100%"
                        if (isCurrent) y = "0%"
                        else if (isPrevious) y = "-100%"

                        const transition =
                            reduced || (!isCurrent && !isPrevious)
                                ? "none"
                                : isCurrent
                                  ? `transform ${TRANSITION_MS}ms var(--ease-enter)`
                                  : "transform var(--duration-enter) var(--ease-exit)"

                        return (
                            <span
                                key={phrase}
                                aria-hidden={isCurrent ? undefined : true}
                                className="absolute left-0 top-0 w-full text-center"
                                style={{
                                    transform: `translateY(${y})`,
                                    transition,
                                }}
                            >
                                {phrase}
                            </span>
                        )
                    })}
                </span>
                <div
                    ref={measureRef}
                    aria-hidden="true"
                    className="invisible pointer-events-none absolute inset-x-0 top-0"
                >
                    {PHRASES.map((phrase) => (
                        <div
                            key={phrase}
                            className="mx-auto w-fit max-w-full font-sans text-display font-bold"
                        >
                            {phrase}
                        </div>
                    ))}
                </div>
            </h1>

            <p className="w-full px-space-4 font-sans text-body font-bold text-text-primary">
                CBC materials from verified teachers. Written for the classrooms
                they teach every week.
            </p>
            </div>

            <div className="flex w-full flex-col gap-space-3 nav:w-auto nav:flex-row nav:items-center">
                <Link
                    href="/teacher-register"
                    className={cn(
                        "fold-cta-sell inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full bg-accent-hover px-space-6 font-sans text-body font-bold text-surface nav:w-auto",
                        "focus-visible:shadow-focus focus-visible:outline-none"
                    )}
                >
                    <Store className="size-space-4" strokeWidth={2} aria-hidden="true" />
                    Sell materials
                </Link>
                <Link
                    href="/marketplace"
                    className={cn(
                        "fold-cta-shop inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full border border-accent-hover bg-surface px-space-6 font-sans text-body font-bold text-accent-hover nav:w-auto",
                        "focus-visible:shadow-focus focus-visible:outline-none"
                    )}
                >
                    <ShoppingBag className="size-space-4" strokeWidth={2} aria-hidden="true" />
                    Shop materials
                </Link>
            </div>
        </section>
    )
}
