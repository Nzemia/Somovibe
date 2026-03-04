"use client"

import {
    useState,
    useEffect,
    useRef,
    useCallback
} from "react"
import Link from "next/link"
import Image from "next/image"

interface Slide {
    id: number
    badge: string
    title: string
    subtitle: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    bgGradient: string
    accentGradient: string
    stats: { value: string; label: string }[]
    icon: React.ReactNode
}

const slides: Slide[] = [
    {
        id: 1,
        badge: "For Teachers",
        title: "Turn Your Teaching Skills Into Extra Income",
        subtitle:
            "Upload your CBC teaching materials and earn 75% commission on every sale. Join hundreds of educators already monetizing their expertise on Somovibe.",
        primaryCta: {
            label: "Start Earning Today",
            href: "/teacher-register"
        },
        secondaryCta: {
            label: "See How It Works",
            href: "#how-it-works"
        },
        bgGradient:
            "from-[#001a0d] via-[#004d25] to-[#008c43]",
        accentGradient: "from-[#008c43] to-[#00b856]",
        stats: [
            { value: "75%", label: "Commission Rate" },
            { value: "500+", label: "Active Teachers" },
            {
                value: "KES 100",
                label: "One-time Verification"
            }
        ],
        icon: (
            <svg
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
            >
                <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="rgba(255,255,255,0.08)"
                />
                <path
                    d="M20 44V24l12-8 12 8v20"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                <rect
                    x="26"
                    y="32"
                    width="12"
                    height="12"
                    rx="1"
                    stroke="white"
                    strokeWidth="2.5"
                />
                <path
                    d="M14 44h36"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <circle
                    cx="44"
                    cy="20"
                    r="6"
                    fill="rgba(0,184,86,0.3)"
                    stroke="white"
                    strokeWidth="2"
                />
                <path
                    d="M41 20l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    },
    {
        id: 2,
        badge: "For Students & Parents",
        title: "Quality CBC Learning Resources at Your Fingertips",
        subtitle:
            "Access notes, past papers, and study guides crafted by verified teachers. Pay securely via M-Pesa and download instantly — anytime, anywhere.",
        primaryCta: {
            label: "Browse Materials",
            href: "/marketplace"
        },
        secondaryCta: {
            label: "Create Free Account",
            href: "/register"
        },
        bgGradient:
            "from-[#002914] via-[#006832] to-[#00a854]",
        accentGradient: "from-[#00a854] to-[#00d468]",
        stats: [
            { value: "10K+", label: "Learning Materials" },
            { value: "50K+", label: "Happy Students" },
            { value: "M-Pesa", label: "Secure Payments" }
        ],
        icon: (
            <svg
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
            >
                <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="rgba(255,255,255,0.08)"
                />
                <rect
                    x="14"
                    y="16"
                    width="22"
                    height="28"
                    rx="2"
                    stroke="white"
                    strokeWidth="2.5"
                />
                <path
                    d="M19 23h12M19 28h12M19 33h8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <rect
                    x="28"
                    y="22"
                    width="22"
                    height="28"
                    rx="2"
                    fill="rgba(0,184,86,0.2)"
                    stroke="white"
                    strokeWidth="2.5"
                />
                <path
                    d="M33 29h12M33 34h12M33 39h8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        )
    }
]

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [prevSlide, setPrevSlide] = useState<
        number | null
    >(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<ReturnType<
        typeof setInterval
    > | null>(null)

    const animateIn = useCallback(async () => {
        if (!contentRef.current) return
        const elements =
            contentRef.current.querySelectorAll<HTMLElement>(
                ".hero-anim"
            )
        try {
            const { animate, stagger, set } =
                await import("animejs")
            set(elements, { opacity: 0, translateY: 32 })
            animate(elements, {
                opacity: [0, 1],
                translateY: [32, 0],
                duration: 750,
                delay: stagger(90, { start: 120 }),
                ease: "outExpo"
            })
        } catch {
            elements.forEach(el => {
                el.style.opacity = "1"
                el.style.transform = "translateY(0)"
            })
        }
    }, [])

    useEffect(() => {
        animateIn()
    }, [currentSlide, animateIn])

    const resetInterval = useCallback(() => {
        if (intervalRef.current)
            clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setCurrentSlide(prev => {
                setPrevSlide(prev)
                return (prev + 1) % slides.length
            })
        }, 6500)
    }, [])

    useEffect(() => {
        resetInterval()
        return () => {
            if (intervalRef.current)
                clearInterval(intervalRef.current)
        }
    }, [resetInterval])

    const goToSlide = (index: number) => {
        if (index === currentSlide) return
        setPrevSlide(currentSlide)
        setCurrentSlide(index)
        resetInterval()
    }

    const slide = slides[currentSlide]

    return (
        <section className="relative w-full h-[calc(100vh-4rem)] overflow-hidden min-h-[580px]">
            {/* Background gradients with crossfade */}
            {slides.map((s, i) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 bg-gradient-to-br ${s.bgGradient} transition-opacity duration-700 ease-in-out ${
                        i === currentSlide
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                />
            ))}

            {/* Subtle dot pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}
            />

            {/* Decorative blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-[80px]" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-[80px]" />
            </div>

            {/* Main content */}
            <div
                ref={contentRef}
                className="relative z-10 h-full flex items-center"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left — text */}
                        <div className="max-w-xl">
                            {/* Badge */}
                            <div className="hero-anim inline-flex items-center gap-2 mb-5 sm:mb-6">
                                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-white/20">
                                    <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse shrink-0" />
                                    {slide.badge}
                                </span>
                            </div>

                            {/* Heading */}
                            <h1 className="hero-anim text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] mb-5 drop-shadow-md">
                                {slide.title}
                            </h1>

                            {/* Subtitle */}
                            <p className="hero-anim text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
                                {slide.subtitle}
                            </p>

                            {/* CTA Buttons */}
                            <div className="hero-anim flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
                                <Link
                                    href={
                                        slide.primaryCta
                                            .href
                                    }
                                    className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-[#008c43] font-bold rounded-xl hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                                >
                                    {slide.primaryCta.label}
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={
                                                2.5
                                            }
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </Link>
                                <Link
                                    href={
                                        slide.secondaryCta
                                            .href
                                    }
                                    className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white active:scale-95 transition-all duration-200 text-sm sm:text-base"
                                >
                                    {
                                        slide.secondaryCta
                                            .label
                                    }
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="hero-anim grid grid-cols-3 gap-3 sm:gap-6 max-w-sm">
                                {slide.stats.map(
                                    (stat, i) => (
                                        <div
                                            key={i}
                                            className="text-center"
                                        >
                                            <div className="text-xl sm:text-2xl font-extrabold text-white drop-shadow">
                                                {stat.value}
                                            </div>
                                            <div className="text-xs text-white/60 mt-0.5 leading-tight">
                                                {stat.label}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Right — decorative illustration (desktop only) */}
                        <div className="hero-anim hidden lg:flex items-center justify-center">
                            <div className="relative">
                                {/* Outer glow ring */}
                                <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-110" />
                                {/* Circle */}
                                <div className="relative w-72 h-72 xl:w-80 xl:h-80 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-44 h-44">
                                        {slide.icon}
                                    </div>
                                </div>
                                {/* Floating badge top-right */}
                                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl">
                                    <div className="text-[#008c43] font-extrabold text-lg leading-none">
                                        {
                                            slide.stats[0]
                                                .value
                                        }
                                    </div>
                                    <div className="text-gray-500 text-xs mt-0.5">
                                        {
                                            slide.stats[0]
                                                .label
                                        }
                                    </div>
                                </div>
                                {/* Floating badge bottom-left */}
                                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl">
                                    <div className="text-[#008c43] font-extrabold text-lg leading-none">
                                        {
                                            slide.stats[1]
                                                .value
                                        }
                                    </div>
                                    <div className="text-gray-500 text-xs mt-0.5">
                                        {
                                            slide.stats[1]
                                                .label
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`rounded-full transition-all duration-400 ${
                            i === currentSlide
                                ? "w-8 sm:w-10 h-2.5 sm:h-3 bg-white shadow-lg"
                                : "w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Slide counter */}
            <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 text-white/40 text-xs font-mono z-20 tabular-nums">
                {String(currentSlide + 1).padStart(2, "0")}{" "}
                / {String(slides.length).padStart(2, "0")}
            </div>

            {/* Somovibe watermark logo */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 opacity-15 pointer-events-none">
                <Image
                    src="/logos/somovibe-logo-white.png"
                    alt=""
                    width={52}
                    height={52}
                    className="h-12 sm:h-14 w-auto object-contain"
                />
            </div>
        </section>
    )
}
